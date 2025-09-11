import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import { AccountType } from 'src/database/postgresql/entity/accountType.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'

export const getUserAccountTypes = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(AccountType)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.params.userId) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountTypes = await dataSource.findBy({ user })

    return createJsonResponse(res, { data: accountTypes, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting account types ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const addUserAccountType = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(AccountType)
    const userRepository = useTypeORM(User)

    const user = await userRepository.findOneBy({ id: Number(req.body.userId) })

    if (!user) {
      return createJsonResponse(res, { msg: 'User not found', status: StatusCodes.NOT_FOUND })
    }

    const accountTypes = await dataSource
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
    const dataSource = useTypeORM(AccountType)
    const accountTypeId = Number(req.params.id)

    const accountType = await dataSource.findOneBy({ id: accountTypeId })
    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account Type not found', status: StatusCodes.NOT_FOUND })
    }

    const updatedUserAccountType = await dataSource.createQueryBuilder().update(AccountType).set(req.body).where({ id: accountTypeId }).returning('*').execute()

    if (updatedUserAccountType.affected === 1) return createJsonResponse(res, { data: updatedUserAccountType.generatedMaps[0], msg: 'Account Type updated', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error updating account type ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const deleteUserAccountType = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(AccountType)
    const accountTypeId = Number(req.params.id)

    const accountType = await dataSource.findOneBy({ id: accountTypeId })
    if (!accountType) {
      return createJsonResponse(res, { msg: 'Account Type not found', status: StatusCodes.NOT_FOUND })
    }

    await dataSource.createQueryBuilder().delete().from(AccountType).where({ id: accountTypeId }).execute()

    return createJsonResponse(res, { msg: 'Account Type deleted', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error deleting Account Type ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
