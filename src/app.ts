import dotenv from 'dotenv'
import express, { Request } from 'express'
import morgan from 'morgan'
import routers from 'src/router'
import appSetup from './init'
import securitySetup from './security'
dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// to see logs in terminal when i do a request
morgan.token('body', (req: Request) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {}))
appSetup(app)
securitySetup(app, express)

Object.values(routers).forEach((router) => router(app))
