import { endOfDay, format, startOfDay } from 'date-fns'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { AccountType } from 'src/database/postgresql/entity/accountType.entity'
import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'
import { RequestWithUser } from 'src/util/interfaces'
import { Between } from 'typeorm'

export const getAllTransactions = async (_: Request, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)

    const transactions = (await transactionRepository.find()).sort((a, b) => a.id - b.id)

    return createJsonResponse(res, { data: transactions, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting transactions ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

const betweenDates = (from: string, to: string) => {
  const fromDate = new Date(from)
  const toDate = new Date(to)

  return Between(fromDate, toDate)
}

export const getUserTransactions = async (req: RequestWithUser, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)
    const userRepository = useTypeORM(User)
    const accountTypeRepository = useTypeORM(AccountType)

    const user = await userRepository.findOneBy({ id: Number(req.user.id) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountType = await accountTypeRepository.findOne({
      where: { id: Number(req.query.accountTypeId) },
      relations: ['user'],
    })

    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account type not found', status: StatusCodes.NOT_FOUND })
    }

    if (accountType.user.id !== user.id) {
      return createJsonResponse(res, {
        msg: 'Access denied: Account type does not belong to this user',
        status: StatusCodes.FORBIDDEN,
      })
    }

    const [transactions, count] = await transactionRepository.findAndCount({
      where: {
        user: { id: user.id },
        createdAt: betweenDates(req.query.from as string, req.query.to as string),
        accountType,
      },
      order: { id: 'ASC' },
    })

    return createJsonResponse(res, { data: { transactions, count }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting transactions ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const getUserTransactionsInfo = async (req: RequestWithUser, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)
    const userRepository = useTypeORM(User)
    const accountTypeRepository = useTypeORM(AccountType)

    const user = await userRepository.findOneBy({ id: Number(req.user.id) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountType = await accountTypeRepository.findOne({
      where: { id: Number(req.query.accountTypeId) },
      relations: ['user'],
    })

    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account type not found', status: StatusCodes.NOT_FOUND })
    }

    if (accountType.user.id !== user.id) {
      return createJsonResponse(res, {
        msg: 'Access denied: Account type does not belong to this user',
        status: StatusCodes.FORBIDDEN,
      })
    }

    // get the balance for each category so in frontend I can show balance and the percentage of amount per category
    const transactionInfo = await transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.user', 'user')
      .leftJoin('transaction.accountType', 'accountType')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('accountType.id = :accountTypeId', { accountTypeId: accountType.id })
      .andWhere('transaction.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: startOfDay(new Date(req.query.from as string)),
        toDate: endOfDay(new Date(req.query.to as string)),
      })
      .select('SUM(transaction.money)', 'balance')
      .addSelect('category')
      .groupBy('category')
      .getRawMany()

    return createJsonResponse(res, { data: transactionInfo, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting transactions ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)
    const userRepository = useTypeORM(User)
    const accountTypeRepository = useTypeORM(AccountType)

    const user = await userRepository.findOneBy({ id: req.body.userId })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountType = await accountTypeRepository.findOneBy({ id: req.body.accountTypeId })

    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account type not found', status: StatusCodes.NOT_FOUND })
    }
    const moneyAmount = typeof req.body.money === 'string' ? parseFloat(req.body.money) : req.body.money
    const transaction = await transactionRepository
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values({
        category: req.body.category,
        money: moneyAmount,
        type: req.body.type,
        user: user,
        accountType,
        createdAt: req.body.createdAt,
      })
      .returning('*')
      .execute()

    if (accountType.balance !== undefined) {
      const newBalance = req.body.type === 'income' ? Number(accountType.balance) + moneyAmount : Number(accountType.balance) - moneyAmount

      await accountTypeRepository.update(accountType.id, { balance: newBalance })
    }

    return createJsonResponse(res, { data: transaction.generatedMaps[0], msg: 'Success', status: StatusCodes.CREATED })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error adding transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const editTransaction = async (req: Request, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)

    const transaction = await transactionRepository.createQueryBuilder().update(Transaction).set(req.body).where('id = :id', { id: req.params.id }).execute()

    if (transaction.affected === 1) return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Transaction updated', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transactionRepository = useTypeORM(Transaction)

    const transaction = await transactionRepository.createQueryBuilder().delete().from(Transaction).where('id = :id', { id: req.params.id }).execute()

    return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
