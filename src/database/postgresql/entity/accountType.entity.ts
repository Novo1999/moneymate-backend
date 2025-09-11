import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique(['name', 'user'])
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @ManyToOne(() => User, (user) => user.accountTypes)
  user: User

  @OneToMany(() => Transaction, (transaction) => transaction.accountType, { onDelete: 'CASCADE' })
  transactions: Transaction[]
}
