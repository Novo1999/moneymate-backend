import { User } from 'src/database/postgresql/entity/user.entity'
import { Check, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum ExpenseCategory {
  FOOD_DRINKS = 'food_drinks',
  SHOPPING = 'shopping',
  HOUSING = 'housing',
  TRANSPORTATION = 'transportation',
  VEHICLE = 'vehicle',
  LIFE_ENTERTAINMENT = 'life_entertainment',
  COMMUNICATION_PC = 'communication_pc',
  FINANCIAL_EXPENSES = 'financial_expenses',
  INVESTMENTS = 'investments',
  OTHERS = 'others',
}

export enum IncomeCategory {
  SALARY = 'salary',
  AWARDS = 'awards',
  GRANTS = 'grants',
  SALE = 'sale',
  RENTAL = 'rental',
  REFUNDS = 'refunds',
  COUPON = 'coupon',
  LOTTERY = 'lottery',
  GIFTS = 'gifts',
  INTERESTS = 'interests',
  OTHERS = 'others',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.transactions)
  user: User

  @Column('decimal')
  money: number

  @Column({ enum: TransactionType, default: TransactionType.INCOME })
  type: TransactionType

  @Column({ enum: [...Object.values(IncomeCategory), ...Object.values(ExpenseCategory)] })
  category: IncomeCategory | ExpenseCategory

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
