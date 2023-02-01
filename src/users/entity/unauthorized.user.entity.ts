import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class UnauthorizedUsers {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
  @Column()
  isUser: boolean;
}
