import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
}
