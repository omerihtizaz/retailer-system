import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginRetailerDto {
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @IsString()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
