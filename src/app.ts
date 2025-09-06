import dotenv from 'dotenv'
import express from 'express'
import appSetup from './init'
import routerSetup from './router'
import securitySetup from './security'
dotenv.config()

const app = express()

appSetup(app)
securitySetup(app, express)
routerSetup(app)
