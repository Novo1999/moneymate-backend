import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm'

let typeORMDB: DataSource

export default async function typeORMConnect(): Promise<void> {
  new DataSource({
    type: 'postgres',
    url: process.env.PGSQL_URI,
    entities: [`${__dirname}/entity/*.entity.ts`],
    synchronize: true,
  })
  console.log('DB Connected')
}

export function useTypeORM(entity: EntityTarget<ObjectLiteral>): Repository<ObjectLiteral> {
  if (!typeORMDB) {
    throw new Error('TypeORM has not been initialized!')
  }

  return typeORMDB.getRepository(entity)
}
