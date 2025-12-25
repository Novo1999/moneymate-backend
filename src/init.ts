import 'reflect-metadata'

import { Express } from 'express'
import typeORMConnect from './database/postgresql/typeorm'

const appSetup = async (app: Express) => {
  const APP_PORT = 8000

  try {
    await typeORMConnect()
    app.listen(APP_PORT, () => {
      console.log(`Server started on port ${APP_PORT}`)
    })
  } catch (error) {
    console.log('Unable to start the app!')
    console.error(error)
  }
}

export default appSetup
