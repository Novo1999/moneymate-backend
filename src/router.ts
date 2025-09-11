import { Express, Request, Response, Router } from 'express'
import { addUserAccountType, deleteUserAccountType, editUserAccountType, getUserAccountTypes } from 'src/controllers/accountType.controller'
import { addUserCategory, deleteUserCategory, editUserCategory, getUserCategories } from 'src/controllers/category.controller'
import { addTransaction, deleteTransaction, editTransaction, getAllTransactions } from 'src/controllers/transaction.controller'
import { getUser, login, patchUserData, signUp } from 'src/controllers/user.controller'
import { ExtendedRequest, verifyToken } from 'src/middleware/authMiddleware'
import { checkIdExists } from 'src/middleware/validationMiddleware'

const routerSetup = (app: Express) =>
  app.get('/', async (req: ExtendedRequest, res: Response) => {
    return res.send('Server works')
  })

const userRouterSetup = (app: Express) => {
  const userRouter = Router()
  app.use('/api/v1/auth', userRouter.post('/signUp', signUp), userRouter.post('/login', login), userRouter.get('/user/:id', getUser), userRouter.patch('/user/:id', patchUserData))
}

const transactionRouterSetup = (app: Express) => {
  const transactionRouter = Router()
  app.use(
    '/api/v1/transaction',
    verifyToken,
    transactionRouter.get('/all', getAllTransactions),
    transactionRouter.post('/add', addTransaction),
    transactionRouter.patch('/edit/:id', checkIdExists, editTransaction),
    transactionRouter.delete('/delete/:id', checkIdExists, deleteTransaction)
  )
}

const categoryRouterSetup = (app: Express) => {
  const categoryRouter = Router()
  app.use(
    '/api/v1/categories',
    verifyToken,
    categoryRouter.get('/:userId', getUserCategories),
    categoryRouter.post('/add', addUserCategory),
    categoryRouter.patch('/edit/:categoryId', checkIdExists, editUserCategory),
    categoryRouter.delete('/delete/:categoryId', checkIdExists, deleteUserCategory)
  )
}

const accountTypeRouterSetup = (app: Express) => {
  const accountTypeRouter = Router()
  app.use(
    '/api/v1/accountType',
    verifyToken,
    accountTypeRouter.get('/:userId', getUserAccountTypes),
    accountTypeRouter.post('/add', addUserAccountType),
    accountTypeRouter.patch('/edit/:categoryId', checkIdExists, editUserAccountType),
    accountTypeRouter.delete('/delete/:categoryId', checkIdExists, deleteUserAccountType)
  )
}

const routers = { routerSetup, transactionRouterSetup, userRouterSetup, categoryRouterSetup, accountTypeRouterSetup }
export default routers
