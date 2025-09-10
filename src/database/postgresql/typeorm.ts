import 'reflect-metadata'
import { AccountType } from 'src/database/postgresql/entity/accountType.entity'
import { Category } from 'src/database/postgresql/entity/category.entity'
import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm'

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
