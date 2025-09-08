import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import 'reflect-metadata'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'

export const signUp = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)
    console.log("🚀 ~ signUp ~ dataSource:", dataSource)

    const { name, email, password } = req.body
    const newUser = await dataSource.createQueryBuilder().insert().into(User).values({ email, name, password }).execute()
    console.log(newUser)

    if (!newUser) return

    return createJsonResponse<Pick<User, 'email' & 'name'>>(res, { msg: 'User Created Successfully', data: { email, name }, status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error creating user', data: error, status: StatusCodes.BAD_REQUEST })
  }
}
