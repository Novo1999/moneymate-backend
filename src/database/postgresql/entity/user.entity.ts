import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[]
}
