import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { AccountType } from '../database/postgresql/entity/accountType.entity'
import { Transaction } from '../database/postgresql/entity/transaction.entity'
import { User } from '../database/postgresql/entity/user.entity'
import { typeORMDB, useTypeORM } from '../database/postgresql/typeorm'
import { ExpenseCategory, IncomeCategory, TransactionType } from '../enums/transaction'
import createJsonResponse from '../util/createJsonResponse'
import { RequestWithUser } from '../util/interfaces'

export const getUserAccountTypes = async (req: RequestWithUser, res: Response) => {
  try {
    const accountTypeRepository = useTypeORM(AccountType)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.user.id) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountTypes = await accountTypeRepository.findBy({ user })

    return createJsonResponse(res, { data: accountTypes, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting account types ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const addUserAccountType = async (req: RequestWithUser, res: Response) => {
  try {
    const accountTypeRepository = useTypeORM(AccountType)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.user.id) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountTypes = await accountTypeRepository
      .createQueryBuilder()
      .insert()
      .into(AccountType)
      .values({ ...req.body, user })
      .returning('*')
      .execute()

    return createJsonResponse(res, { data: accountTypes.generatedMaps[0], msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error adding account types ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const editUserAccountType = async (req: Request, res: Response) => {
  try {
    const accountTypeRepository = useTypeORM(AccountType)
    const accountTypeId = Number(req.params.id)

    const accountType = await accountTypeRepository.findOneBy({ id: accountTypeId })
    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account Type not found', status: StatusCodes.NOT_FOUND })
    }

    const updatedUserAccountType = await accountTypeRepository.createQueryBuilder().update(AccountType).set(req.body).where({ id: accountTypeId }).returning('*').execute()

    if (updatedUserAccountType.affected === 1) return createJsonResponse(res, { data: updatedUserAccountType.generatedMaps[0], msg: 'Account Type updated', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error updating account type ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

const cleanUser = (user: User) => {
  delete user.password
  return user
}
export const transferBalance = async (req: Request, res: Response) => {
  const queryRunner = typeORMDB.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const accountTypeRepository = queryRunner.manager.getRepository(AccountType)
    const transactionRepository = queryRunner.manager.getRepository(Transaction)

    const senderId = Number(req.body.senderId)
    const receiverId = Number(req.body.receiverId)
    const transferAmount = Number(req.body.balance)

    if (senderId === receiverId) {
      return createJsonResponse(res, {
        msg: 'Sender and receiver accounts must be different',
        status: StatusCodes.BAD_REQUEST,
      })
    }

    if (transferAmount <= 0) {
      return createJsonResponse(res, {
        msg: 'Transfer amount must be greater than 0',
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const senderAccountType = await accountTypeRepository.findOne({
      where: { id: senderId },
      relations: ['user'],
    })

    const receiverAccountType = await accountTypeRepository.findOne({
      where: { id: receiverId },
      relations: ['user'],
    })

    if (!senderAccountType) {
      return createJsonResponse(res, {
        msg: 'Sender account not found',
        status: StatusCodes.NOT_FOUND,
      })
    }

    if (!receiverAccountType) {
      return createJsonResponse(res, {
        msg: 'Receiver account not found',
        status: StatusCodes.NOT_FOUND,
      })
    }

    if (senderAccountType.user.id !== receiverAccountType.user.id) {
      return createJsonResponse(res, {
        msg: 'Cannot transfer between different users',
        status: StatusCodes.FORBIDDEN,
      })
    }

    const currentSenderBalance = Number(senderAccountType.balance) || 0
    const newSenderBalance = currentSenderBalance - transferAmount
    const newReceiverBalance = (Number(receiverAccountType.balance) || 0) + transferAmount

    if (newSenderBalance < 0) {
      return createJsonResponse(res, {
        msg: 'Insufficient balance in sender account',
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const transferDate = req.body.createdAt ? new Date(req.body.createdAt) : new Date()

    const senderTransaction = await transactionRepository.save({
      category: ExpenseCategory.TRANSFER,
      money: transferAmount,
      type: TransactionType.EXPENSE,
      user: cleanUser(senderAccountType.user),
      accountType: senderAccountType,
      createdAt: transferDate,
    })

    const receiverTransaction = await transactionRepository.save({
      category: IncomeCategory.TRANSFER,
      money: transferAmount,
      type: TransactionType.INCOME,
      user: cleanUser(receiverAccountType.user),
      accountType: receiverAccountType,
      createdAt: transferDate,
    })

    await accountTypeRepository.update({ id: senderId }, { balance: newSenderBalance })

    await accountTypeRepository.update({ id: receiverId }, { balance: newReceiverBalance })

    await queryRunner.commitTransaction()

    return createJsonResponse(res, {
      data: {
        senderTransaction,
        receiverTransaction,
        newSenderBalance,
        newReceiverBalance,
      },
      msg: 'Transfer completed successfully',
      status: StatusCodes.OK,
    })
  } catch (error) {
    await queryRunner.rollbackTransaction()

    return createJsonResponse(res, {
      msg: error,
      status: StatusCodes.BAD_REQUEST,
    })
  } finally {
    await queryRunner.release()
  }
}

export const deleteUserAccountType = async (req: Request, res: Response) => {
  try {
    const accountTypeRepository = useTypeORM(AccountType)
    const accountTypeId = Number(req.params.id)

    const accountType = await accountTypeRepository.findOneBy({ id: accountTypeId })
    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account Type not found', status: StatusCodes.NOT_FOUND })
    }

    await accountTypeRepository.createQueryBuilder().delete().from(AccountType).where({ id: accountTypeId }).execute()

    return createJsonResponse(res, { msg: 'Account Type deleted', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error deleting Account Type ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
