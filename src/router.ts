import { Express, Request, Response, Router } from 'express'
import { addUserAccountType, deleteUserAccountType, editUserAccountType, getUserAccountTypes, transferBalance } from './controllers/accountType.controller'
import { addUserCategory, deleteUserCategory, editUserCategory, getUserCategories } from './controllers/category.controller'
import { addTransaction, deleteTransaction, editTransaction, getAllTransactions, getUserTransactions, getUserTransactionsInfo } from './controllers/transaction.controller'
import { getUser, login, patchUserData, signUp } from './controllers/user.controller'
import { ExtendedRequest, verifyToken } from './middleware/authMiddleware'
import { checkIdExists, validateGetUserTransactions } from './middleware/validationMiddleware'

const routerSetup = (app: Express) =>
  app.get('/', async (req: ExtendedRequest, res: Response) => {
    return res.send('Server works')
  })

const userRouterSetup = (app: Express) => {
  const userRouter = Router()
  app.use('/api/v1/auth', userRouter.post('/signUp', signUp), userRouter.post('/login', login), userRouter.get('/user/:id', verifyToken, getUser), userRouter.patch('/user/:id', patchUserData))
}

const transactionRouterSetup = (app: Express) => {
  const transactionRouter = Router()
  app.use(
    '/api/v1/transaction',
    verifyToken,
    transactionRouter.get('/all', getAllTransactions),
    transactionRouter.get('/:userId', validateGetUserTransactions, getUserTransactions),
    transactionRouter.get('/info', validateGetUserTransactions, getUserTransactionsInfo),
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
    categoryRouter.get('/', getUserCategories),
    categoryRouter.post('/add', addUserCategory),
    categoryRouter.patch('/edit/:id', checkIdExists, editUserCategory),
    categoryRouter.delete('/delete/:id', checkIdExists, deleteUserCategory)
  )
}

const accountTypeRouterSetup = (app: Express) => {
  const accountTypeRouter = Router()
  app.use(
    '/api/v1/accountType',
    verifyToken,
    accountTypeRouter.get('/', getUserAccountTypes),
    accountTypeRouter.post('/add', addUserAccountType),
    accountTypeRouter.patch('/edit/:id', checkIdExists, editUserAccountType),
    accountTypeRouter.patch('/transfer', transferBalance),
    accountTypeRouter.delete('/delete/:id', checkIdExists, deleteUserAccountType)
  )
}

const routers = { routerSetup, transactionRouterSetup, userRouterSetup, categoryRouterSetup, accountTypeRouterSetup }
export default routers
