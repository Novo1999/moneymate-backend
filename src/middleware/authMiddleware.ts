import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import createJsonResponse from 'src/util/createJsonResponse'

export interface ExtendedRequest extends Request {
  user?: string | JwtPayload
}

export const verifyToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')
  if (!token) return createJsonResponse(res, { msg: 'Access Denied', status: StatusCodes.UNAUTHORIZED })

  try {
    const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET)
    console.log("🚀 ~ verifyToken ~ verified:", verified)
    req.user = verified
    next()
  } catch (error) {
    return createJsonResponse(res, { msg: 'Invalid Token', status: StatusCodes.UNAUTHORIZED })
  }
}
