import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class KeepAlive {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  alive: boolean
}
