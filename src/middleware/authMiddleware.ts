import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import createJsonResponse from '../util/createJsonResponse'

export interface ExtendedRequest extends Request {
  user?: string | JwtPayload
}

export const verifyToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createJsonResponse(res, {
      msg: 'Access Denied - No token provided',
      status: StatusCodes.UNAUTHORIZED,
    })
  }

  // Extract token after "Bearer "
  const token = authHeader.split(' ')[1]

  if (!token) {
    return createJsonResponse(res, {
      msg: 'Access Denied - Invalid token format',
      status: StatusCodes.UNAUTHORIZED,
    })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    return createJsonResponse(res, {
      msg: 'Invalid Token',
      status: StatusCodes.UNAUTHORIZED,
    })
  }
}
