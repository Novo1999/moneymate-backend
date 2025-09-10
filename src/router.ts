import { Express, Request, Response, Router } from 'express'
import { addUserCategory, deleteUserCategory, editUserCategory, getUserCategories } from 'src/controllers/category.controller'
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

const categoryRouterSetup = (app: Express) => {
  app.use(
    '/api/v1/category',
    verifyToken,
    router.get('/:userId', getUserCategories),
    router.post('/:userId/add', addUserCategory),
    router.patch('/edit/:categoryId', checkIdExists, editUserCategory),
    router.delete('/delete/:categoryId', checkIdExists, deleteUserCategory)
  )
}

const routers = { routerSetup, transactionRouterSetup, userRouterSetup, categoryRouterSetup }
export default routers
