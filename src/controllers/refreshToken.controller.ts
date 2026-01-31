import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { RefreshToken } from '../database/postgresql/entity/refreshtoken.entity'
import { useTypeORM } from '../database/postgresql/typeorm'
import createJsonResponse from '../util/createJsonResponse'

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenDataSource = useTypeORM(RefreshToken)

    // Step 1: Get refresh token from cookie
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) {
      return createJsonResponse(res, {
        msg: 'No refresh token provided',
        status: StatusCodes.BAD_REQUEST,
      })
    }

     const refreshToken = await refreshTokenDataSource.findOne({
      where: { token: oldRefreshToken },
      relations: ['user'],
    })

    // Check if token is revoked
    if (refreshToken.revokedAt !== null) {
      return createJsonResponse(res, {
        msg: 'Refresh token has been revoked',
        status: StatusCodes.BAD_REQUEST,
      })
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      return createJsonResponse(res, {
        msg: 'Refresh token expired',
        status: StatusCodes.BAD_REQUEST,
      })
    }

    const newAccessToken = jwt.sign(
      {
        email: refreshToken.user.email,
        id: refreshToken.user.id,
        name: refreshToken.user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )
    const newRefreshToken = jwt.sign(
      {
        email: refreshToken.user.email,
        id: refreshToken.user.id,
        name: refreshToken.user.name,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    await refreshTokenDataSource.update(
      {
        id: refreshToken.id,
      },
      {
        revokedAt: new Date(),
      }
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await refreshTokenDataSource.insert({
      user: refreshToken.user,
      token: newRefreshToken,
      expiresAt,
      revokedAt: null,
    })

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return createJsonResponse(res, {
      msg: 'Token Refreshed',
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Invalid refresh token',
      status: StatusCodes.BAD_REQUEST,
    })
  }
}
