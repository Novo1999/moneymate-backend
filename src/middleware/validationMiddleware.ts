import { NextFunction, Request, Response } from 'express'
import { param, validationResult } from 'express-validator'

import { body, query } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import createJsonResponse from 'src/util/createJsonResponse'

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

export const validateGetUserTransactions = [
  query('from').notEmpty().withMessage('From date is required').isISO8601().withMessage('From date must be a valid ISO 8601 date'),

  query('to')
    .notEmpty()
    .withMessage('To date is required')
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date')
    .custom((to, { req }) => {
      const fromDate = new Date(req.query?.from as string)
      const toDate = new Date(to)

      if (toDate <= fromDate) {
        throw new Error('To date must be after from date')
      }
      return true
    }),

  query('accountTypeId').isInt({ min: 1 }).withMessage('Account Type ID must be a positive integer'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg)
      return createJsonResponse(res, {
        msg: errorMessages.join(', '),
        status: StatusCodes.BAD_REQUEST,
      })
    }

    next()
  },
]
