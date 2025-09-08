import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { User } from 'src/database/postgresql/entity/user.entity'
import { useTypeORM } from 'src/database/postgresql/typeorm'
import createJsonResponse from 'src/util/createJsonResponse'

export const signUp = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)

    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await dataSource.createQueryBuilder().insert().into(User).values({ email, name, password: hashedPassword }).execute()

    if (!newUser) {
      return createJsonResponse(res, {
        msg: 'User creation failed',
        data: null,
        status: StatusCodes.BAD_REQUEST,
      })
    }

    return createJsonResponse<Pick<User, 'email' | 'name'>>(res, {
      msg: 'User Created Successfully',
      data: { email, name },
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error creating user',
      data: error,
      status: StatusCodes.BAD_REQUEST,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)

    const { email, password } = req.body

    const user = await dataSource.createQueryBuilder('user').where('user.email = :email', { email }).getOne()

    if (!user) createJsonResponse(res, { msg: 'Invalid Credentials', status: StatusCodes.UNAUTHORIZED })
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return createJsonResponse(res, { msg: 'Invalid Credentials', status: StatusCodes.UNAUTHORIZED })

    const token = jwt.sign({ email, id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    return createJsonResponse(res, { msg: 'Logged In', data: { token }, status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error logging in',
      data: error,
      status: StatusCodes.BAD_REQUEST,
    })
  }
}
