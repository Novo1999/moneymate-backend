import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { RefreshToken } from '../database/postgresql/entity/refreshtoken.entity'
import { User } from '../database/postgresql/entity/user.entity'
import { useTypeORM } from '../database/postgresql/typeorm'
import createErrorResponse from '../util/createErrorResponse'
import createJsonResponse from '../util/createJsonResponse'

export const signUp = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)

    const { name, email, password, currency } = req.body

    const exists = await dataSource.findOneBy({ email })

    if (exists) {
      throw new Error('An user by this email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await dataSource.createQueryBuilder().insert().into(User).values({ email, name, password: hashedPassword, currency }).execute()

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
    return createErrorResponse(res, {
      msg: error instanceof Error ? error.message : 'Error creating user',
      status: StatusCodes.BAD_REQUEST,
      error,
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)
    const refreshTokenDataSource = useTypeORM(RefreshToken)

    const { email, password } = req.body

    const user = await dataSource.createQueryBuilder('user').where('user.email = :email', { email }).getOne()

    if (!user) createJsonResponse(res, { msg: 'Invalid Credentials', status: StatusCodes.UNAUTHORIZED })
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return createJsonResponse(res, { msg: 'Invalid Credentials', status: StatusCodes.UNAUTHORIZED })

    const refreshToken = jwt.sign({ email, id: user.id, name: user.name }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

    const accessToken = jwt.sign({ email, id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await refreshTokenDataSource.insert({ user, expiresAt, revokedAt: null, token: refreshToken })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return createJsonResponse(res, { msg: 'Logged In', data: { email: user.email, currency: user.currency }, status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error logging in ' + error,
      data: error,
      status: StatusCodes.BAD_REQUEST,
    })
  }
}

export const patchUserData = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)

    const user = await dataSource.createQueryBuilder().update().set(req.body).where('id = :id', { id: req.params.id }).execute()

    return createJsonResponse(res, { data: { affected: user.affected }, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error editing user ' + error, status: StatusCodes.BAD_REQUEST })
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const dataSource = useTypeORM(User)

    const user = await dataSource.findOneBy({ id: Number(req.params.id) })
    delete user.password

    return createJsonResponse(res, { data: user, msg: 'Success', status: StatusCodes.OK })
  } catch (error) {
    return createJsonResponse(res, { msg: 'Error getting user ' + error, status: StatusCodes.BAD_REQUEST })
  }
}
