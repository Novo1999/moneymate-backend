import { Express, Request, Response, Router } from 'express'
import { signUp } from 'src/controllers/user.controller'
const router = Router()

const routerSetup = (app: Express) =>
  app.get('/', async (req: Request, res: Response) => {
    res.send('Server is working')
  })

const userRouterSetup = (app: Express) => {
  app.use('/api/v1/auth', router.post('/signUp', signUp))
}

const routers = { routerSetup, userRouterSetup }
export default routers
