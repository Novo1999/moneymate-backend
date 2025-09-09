import { Express, Request, Response, Router } from 'express'
import { addTransaction, deleteTransaction, editTransaction, getAllTransactions } from 'src/controllers/transaction.controller'
import { getUser, login, patchUserData, signUp } from 'src/controllers/user.controller'
import { ExtendedRequest, verifyToken } from 'src/middleware/authMiddleware'
import { checkIdExists } from 'src/middleware/validationMiddleware'
const router = Router()

const routerSetup = (app: Express) =>
  app.get('/', async (req: ExtendedRequest, res: Response) => {
    return res.send('Server works')
  })

const userRouterSetup = (app: Express) => {
  app.use('/api/v1/auth', router.post('/signUp', signUp), router.post('/login', login), router.get('/user/:id', getUser), router.patch('/user/:id', patchUserData))
}

const transactionRouterSetup = (app: Express) => {
  app.use(
    '/api/v1/transaction',
    verifyToken,
    router.get('/all', getAllTransactions),
    router.post('/add', addTransaction),
    router.patch('/edit/:id', checkIdExists, editTransaction),
    router.delete('/delete/:id', checkIdExists, deleteTransaction)
  )
}

const routers = { routerSetup, transactionRouterSetup, userRouterSetup }
export default routers
