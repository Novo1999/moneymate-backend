import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes/build/cjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import createJsonResponse from '../util/createJsonResponse'

export interface ExtendedRequest extends Request {
  user?: string | JwtPayload
}

export const verifyToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // Get token from cookies instead of header
  const token = req.cookies.accessToken
  console.log("🚀 ~ verifyToken ~ token:", token)
  
  if (!token) {
    return createJsonResponse(res, { 
      msg: 'Access Denied', 
      status: StatusCodes.UNAUTHORIZED 
    })
  }

  try {
    // No need to split - cookie value is just the token
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    return createJsonResponse(res, { 
      msg: 'Invalid Token', 
      status: StatusCodes.UNAUTHORIZED 
    })
  }
}
