import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
}
