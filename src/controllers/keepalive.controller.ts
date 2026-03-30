import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { KeepAlive } from '../database/postgresql/entity/keepalive.entity'
import { useTypeORM } from '../database/postgresql/typeorm'
import createJsonResponse from '../util/createJsonResponse'
import { RequestWithUser } from '../util/interfaces'

export const keepAlive = async (_req: RequestWithUser, res: Response) => {
  try {
    const keepAliveRepository = useTypeORM(KeepAlive)

    const keepAlive = await keepAliveRepository.find()

    return createJsonResponse(res, { data: keepAlive, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting account types ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
