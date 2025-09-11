import { format } from 'date-fns'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { AccountType } from 'src/database/postgresql/entity/accountType.entity'
import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'
import { Between } from 'typeorm'

export const getAllTransactions = async (_: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transactions = (await dataSource.find()).sort((a, b) => a.id - b.id)

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

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.params.userId) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const [transactions, count] = await dataSource.findAndCount({
      where: {
        user: { id: user.id },
        createdAt: betweenDates(req.query.from as string, req.query.to as string),
      },
      order: { id: 'ASC' },
    })

    return createJsonResponse(res, { data: { transactions, count }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting transactions ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)
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

    const transaction = await dataSource
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values({
        category: req.body.category,
        money: req.body.money,
        type: req.body.type,
        user: user,
        accountType,
        createdAt: req.body.createdAt,
      })
      .returning('*')
      .execute()

    return createJsonResponse(res, { data: transaction.generatedMaps[0], msg: 'Success', status: StatusCodes.CREATED })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error adding transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const editTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transaction = await dataSource.createQueryBuilder().update(Transaction).set(req.body).where('id = :id', { id: req.params.id }).execute()

    if (transaction.affected === 1) return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Transaction updated', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transaction = await dataSource.createQueryBuilder().delete().from(Transaction).where('id = :id', { id: req.params.id }).execute()

    return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
