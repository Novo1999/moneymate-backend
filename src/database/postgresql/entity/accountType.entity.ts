import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Transaction } from './transaction.entity'
import { User } from './user.entity'

@Entity()
@Unique(['name', 'user'])
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(() => User, (user) => user.accountTypes, { nullable: false })
  user: User

  @OneToMany(() => Transaction, (transaction) => transaction.accountType, { onDelete: 'CASCADE' })
  transactions: Transaction[]

  @Column('decimal')
  balance: number
}
