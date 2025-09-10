import { User } from 'src/database/postgresql/entity/user.entity'
import { TransactionType } from 'src/enums/transaction'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ enum: TransactionType, default: TransactionType.INCOME })
  type: TransactionType

  @Column()
  icon: string

  @ManyToOne(() => User, (user) => user.categories)
  user: User
}
