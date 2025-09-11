import { User } from 'src/database/postgresql/entity/user.entity'
import { TransactionType } from 'src/enums/transaction'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'

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
