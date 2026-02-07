import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { AccountType } from './src/database/postgresql/entity/accountType.entity'
import { Category } from './src/database/postgresql/entity/category.entity'
import { Transaction } from './src/database/postgresql/entity/transaction.entity'
import { User } from './src/database/postgresql/entity/user.entity'

config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PGSQL_HOST,
  port: Number(process.env.PGSQL_PORT),
  username: process.env.PGSQL_USERNAME,
  password: process.env.PGSQL_PASSWORD,
  database: process.env.PGSQL_DATABASE,
  entities: [User, Transaction, Category, AccountType],
  migrations: ['./src/migration/**/*.ts'],
  migrationsRun: false,
  synchronize: false,
  logging: true,
})
