import dotenv from 'dotenv'
import express from 'express'
import 'reflect-metadata'
import routers from 'src/router'
import appSetup from './init'
import securitySetup from './security'
dotenv.config()

const app = express()

appSetup(app)
securitySetup(app, express)

Object.values(routers).forEach((router) => router(app))
