import { Express, Request, Response, Router } from 'express'
import { login, signUp } from 'src/controllers/user.controller'
import { ExtendedRequest, verifyToken } from 'src/middleware/authMiddleware'
const router = Router()

const routerSetup = (app: Express) =>
  app.get('/', async (req: ExtendedRequest, res: Response) => {
    return res.send("Server works")
  })

const userRouterSetup = (app: Express) => {
  app.use('/api/v1/auth', router.post('/signUp', signUp).post('/login', login))
}

const routers = { routerSetup, userRouterSetup }
export default routers
