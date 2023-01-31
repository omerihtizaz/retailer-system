import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Retailer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: String;
  @Column()
  email: String;
  @Column()
  password: String;
}
