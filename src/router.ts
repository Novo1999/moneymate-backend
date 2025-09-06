import { Express, Request, Response } from 'express'

const routerSetup = (app: Express) =>
  app.get('/', async (req: Request, res: Response) => {
    res.send('Server is working')
  })

export default routerSetup
