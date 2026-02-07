import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { TransactionType } from '../../../enums/transaction'
import { AccountType } from './accountType.entity'
import { User } from './user.entity'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.transactions)
  user: User

  @ManyToOne(() => AccountType, (accountType) => accountType.transactions, {
    nullable: false,
  })
  accountType: AccountType

  @Column('decimal')
  money: number

  @Column({ nullable: true })
  note: string

  @Column({ enum: TransactionType, default: TransactionType.INCOME })
  type: TransactionType

  @Column({ type: 'varchar' })
  category: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
