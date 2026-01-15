import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  user: User

  @Column()
  token: string

  @CreateDateColumn()
  createdAt: Date

  @Column()
  expiresAt: Date

  @Column({ nullable: true, default: null })
  revokedAt: Date | null
}
