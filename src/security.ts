import cors from 'cors'
import { Express } from 'express'

const securitySetup = (app: Express, express: any) =>
  app
    .use(
      cors({
        origin: process.env.BASE_URL,
        credentials: true,
      })
    )
    .use(express.json())

export default securitySetup
