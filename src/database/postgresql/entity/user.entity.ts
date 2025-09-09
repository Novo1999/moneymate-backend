import { Transaction } from 'src/database/postgresql/entity/transaction.entity'
import { Currency } from 'src/enums/currency'
import { DayOfWeek } from 'src/enums/week'
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

  @Column({ type: "enum", enum: Currency, default: "USD", nullable: true })
  currency: Currency

  @OneToMany(() => Transaction, (transaction) => transaction.user, { onDelete: 'CASCADE' })
  transactions: Transaction[]

  @Column({ enum: DayOfWeek, default: 'Sunday', nullable: true })
  firstDayOfWeek: DayOfWeek

  @Column({ default: 1, nullable: true })
  firstDayOfMonth: number
}
