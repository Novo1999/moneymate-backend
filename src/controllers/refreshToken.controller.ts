import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { RefreshToken } from '../database/postgresql/entity/refreshtoken.entity'
import { useTypeORM } from '../database/postgresql/typeorm'
import createJsonResponse from '../util/createJsonResponse'

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenDataSource = useTypeORM(RefreshToken)

    // Step 1: Get refresh token from request body instead of cookie
    const oldRefreshToken = req.body.refreshToken
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

    if (!refreshToken) {
      return createJsonResponse(res, {
        msg: 'Invalid refresh token',
        status: StatusCodes.BAD_REQUEST,
      })
    }

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
      { expiresIn: '15m' },
    )
    const newRefreshToken = jwt.sign(
      {
        email: refreshToken.user.email,
        id: refreshToken.user.id,
        name: refreshToken.user.name,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    )

    // Revoke old refresh token
    await refreshTokenDataSource.update(
      {
        id: refreshToken.id,
      },
      {
        revokedAt: new Date(),
      },
    )

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Save new refresh token
    await refreshTokenDataSource.insert({
      user: refreshToken.user,
      token: newRefreshToken,
      expiresAt,
      revokedAt: null,
    })

    // Return tokens in response body
    return createJsonResponse(res, {
      msg: 'Token Refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      status: StatusCodes.OK,
    })
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Invalid refresh token',
      status: StatusCodes.BAD_REQUEST,
    })
  }
}
