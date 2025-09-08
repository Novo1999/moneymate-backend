import 'reflect-metadata'
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
    entities: [User],
    synchronize: true,
  })

  await typeORMDB.initialize() // ← Call initialize on the assigned variable
  console.log('DB Connected')
}

export function useTypeORM(entity: EntityTarget<ObjectLiteral>): Repository<ObjectLiteral> {
  if (!typeORMDB || !typeORMDB.isInitialized) {
    throw new Error('TypeORM has not been initialized!')
  }

  return typeORMDB.getRepository(entity)
}
