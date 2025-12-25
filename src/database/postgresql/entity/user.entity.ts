import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Currency } from '../../../enums/currency'
import { DayOfWeek } from '../../../enums/week'
import { AccountType } from './accountType.entity'
import { Category } from './category.entity'
import { Transaction } from './transaction.entity'

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

  @Column({ type: 'enum', enum: Currency, default: 'USD', nullable: true })
  currency: Currency

  @OneToMany(() => Transaction, (transaction) => transaction.user, { onDelete: 'CASCADE' })
  transactions: Transaction[]

  @OneToMany(() => Category, (category) => category.user, { onDelete: 'CASCADE' })
  categories: Category[]

  @OneToMany(() => AccountType, (accountType) => accountType.user, { onDelete: 'CASCADE' })
  accountTypes: AccountType[]

  @Column({ enum: DayOfWeek, default: 'Sunday', nullable: true })
  firstDayOfWeek: DayOfWeek

  @Column({ default: 1, nullable: true })
  firstDayOfMonth: number

  @Column({ default: 'day' })
  viewMode: string

  @Column({ nullable: true })
  activeAccountTypeId: number
}
