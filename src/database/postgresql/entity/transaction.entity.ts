import { AccountType } from 'src/database/postgresql/entity/accountType.entity'
import { User } from 'src/database/postgresql/entity/user.entity'
import { ExpenseCategory, IncomeCategory, TransactionType } from 'src/enums/transaction'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column({ enum: TransactionType, default: TransactionType.INCOME })
  type: TransactionType

  @Column({ type: 'enum', enum: [...Object.values(IncomeCategory), ...Object.values(ExpenseCategory)] })
  category: IncomeCategory | ExpenseCategory

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
