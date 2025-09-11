import { User } from 'src/database/postgresql/entity/user.entity'
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class AccountType {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @OneToMany(() => User, (user) => user.accountTypes)
  user: User
}
