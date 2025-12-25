
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { TransactionType } from '../../../enums/transaction'
import { User } from './user.entity'

@Entity()
@Unique(['name', 'user'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ enum: TransactionType, default: TransactionType.INCOME })
  type: TransactionType

  @Column()
  icon: string

  @ManyToOne(() => User, (user) => user.categories)
  user: User
}
