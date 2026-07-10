import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { AccountType } from '../database/postgresql/entity/accountType.entity'
import { RefreshToken } from '../database/postgresql/entity/refreshtoken.entity'
import { User } from '../database/postgresql/entity/user.entity'
import { useTypeORM } from '../database/postgresql/typeorm'
import createErrorResponse from '../util/createErrorResponse'
import createJsonResponse from '../util/createJsonResponse'
import { RequestWithUser } from '../util/interfaces'

// Accepts one or more comma-separated client IDs (web + iOS) to validate the token audience.
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_ID || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)
const googleClient = new OAuth2Client()

// Issues an access + refresh token pair for a user and persists the refresh token (same as login).
const issueSession = async (user: User) => {
  const refreshTokenDataSource = useTypeORM(RefreshToken)
  const payload = { email: user.email, id: user.id, name: user.name }
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  await refreshTokenDataSource.insert({ user, expiresAt, revokedAt: null, token: refreshToken })

  return { accessToken, refreshToken }
}

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

    if (!user) return createJsonResponse(res, { msg: 'Invalid Credentials', status: StatusCodes.UNAUTHORIZED })

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) return createJsonResponse(res, { msg: 'Please Enter Correct Password.', status: StatusCodes.BAD_REQUEST })

    const refreshToken = jwt.sign({ email, id: user.id, name: user.name }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

    const accessToken = jwt.sign({ email, id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' })

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    await refreshTokenDataSource.insert({ user, expiresAt, revokedAt: null, token: refreshToken })

    // Send tokens in response body instead of cookies
    return createJsonResponse(res, {
      msg: 'Logged In',
      data: {
        email: user.email,
        currency: user.currency,
        id: user.id,
        accessToken,
        refreshToken,
      },
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error logging in ' + error,
      data: error,
      status: StatusCodes.BAD_REQUEST,
    })
  }
}
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshTokenDataSource = useTypeORM(RefreshToken)

    // Get refresh token from request body
    const refreshToken = req.body.refreshToken

    if (refreshToken) {
      // Revoke the refresh token in database
      await refreshTokenDataSource.update({ token: refreshToken }, { revokedAt: new Date() })
    }

    return createJsonResponse(res, {
      msg: 'Logged out successfully',
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error logging out',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
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

export const getUser = async (req: RequestWithUser, res: Response) => {
  try {
    const user = req.user
    const dataSource = useTypeORM(User)

    const userData = await dataSource.findOne({
      where: { id: user.id },
    })

    if (!userData) {
      return createJsonResponse(res, {
        msg: 'User not found',
        status: StatusCodes.NOT_FOUND,
      })
    }

    delete userData.password

    return createJsonResponse(res, {
      data: userData,
      msg: 'Success',
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Error getting user',
      status: StatusCodes.UNAUTHORIZED,
    })
  }
}

// Native Google sign-in: the mobile app sends the Google `idToken` obtained from
// @react-native-google-signin. We verify it, find-or-create the user, and return the
// same token payload as `login`.
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body

    if (!idToken) {
      return createJsonResponse(res, { msg: 'idToken is required', status: StatusCodes.BAD_REQUEST })
    }
    if (GOOGLE_CLIENT_IDS.length === 0) {
      return createJsonResponse(res, { msg: 'Google sign-in is not configured on the server', status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_IDS })
    const payload = ticket.getPayload()

    if (!payload?.email) {
      return createJsonResponse(res, { msg: 'Invalid Google credentials', status: StatusCodes.UNAUTHORIZED })
    }

    const userRepository = useTypeORM(User)
    const accountTypeRepository = useTypeORM(AccountType)

    let user = await userRepository.findOneBy({ email: payload.email })

    // First-time Google user: provision an account with a random password + default "Cash" account.
    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      const inserted = await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ email: payload.email, name: payload.name || payload.email.split('@')[0], password: randomPassword, currency: 'USD' as never })
        .returning('*')
        .execute()

      user = (await userRepository.findOneBy({ email: payload.email }))!

      const account = await accountTypeRepository
        .createQueryBuilder()
        .insert()
        .into(AccountType)
        .values({ name: 'Cash', balance: 0, user } as never)
        .returning('*')
        .execute()

      const accountId = account.generatedMaps[0]?.id
      if (accountId) {
        await userRepository.update({ id: user.id }, { activeAccountTypeId: accountId })
        user.activeAccountTypeId = accountId
      }
      void inserted
    }

    const { accessToken, refreshToken } = await issueSession(user)

    return createJsonResponse(res, {
      msg: 'Logged In',
      data: {
        email: user.email,
        currency: user.currency,
        id: user.id,
        accessToken,
        refreshToken,
      },
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createErrorResponse(res, {
      msg: error instanceof Error ? error.message : 'Google sign-in failed',
      status: StatusCodes.UNAUTHORIZED,
      error,
    })
  }
}
