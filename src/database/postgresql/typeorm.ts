import 'reflect-metadata'

import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm'
import { AccountType } from './entity/accountType.entity'
import { Category } from './entity/category.entity'
import { Transaction } from './entity/transaction.entity'
import { User } from './entity/user.entity'

let typeORMDB: DataSource

export default async function typeORMConnect(): Promise<void> {
  typeORMDB = new DataSource({
    type: 'postgres',
    host: process.env.PGSQL_HOST,
    port: Number(process.env.PGSQL_PORT),
    username: process.env.PGSQL_USERNAME,
    password: process.env.PGSQL_PASSWORD,
    database: process.env.PGSQL_DATABASE,
    entities: [User, Transaction, Category, AccountType],
    synchronize: true,
  })

  await typeORMDB.initialize()
  console.log('DB Connected')
}

export function useTypeORM<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
  if (!typeORMDB || !typeORMDB.isInitialized) {
    throw new Error('TypeORM has not been initialized!')
  }

  return typeORMDB.getRepository(entity)
}

export { typeORMDB }

