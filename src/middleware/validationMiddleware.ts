import { NextFunction, Request, Response } from 'express'
import { param, validationResult } from 'express-validator'

export const checkIdExists = [
  param('id').notEmpty().withMessage('No Id was provided').isNumeric().withMessage('ID must be a number'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'Validation failed',
        errors: errors.array(),
        status: 400,
      })
    }

    next()
  },
]
