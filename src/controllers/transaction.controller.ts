import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'

export const getAllTransactions = async (_: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transactions = (await dataSource.find()).sort((a, b) => a.id - b.id)

    return createJsonResponse(res, { data: transactions, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction', status: StatusCodes.BAD_REQUEST })
  }
}

export const addTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: req.body.userId })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
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
      })
      .returning('*')
      .execute()

    return createJsonResponse(res, { data: transaction.generatedMaps[0], msg: 'Success', status: StatusCodes.CREATED })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error adding transaction', status: StatusCodes.BAD_REQUEST })
  }
}

export const editTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transaction = await dataSource.createQueryBuilder().update(Transaction).set(req.body).where('id = :id', { id: req.params.id }).execute()

    return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction', status: StatusCodes.BAD_REQUEST })
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(Transaction)

    const transaction = await dataSource.createQueryBuilder().delete().from(Transaction).where('id = :id', { id: req.params.id }).execute()

    return createJsonResponse(res, { data: { affected: transaction.affected }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing transaction', status: StatusCodes.BAD_REQUEST })
  }
}
