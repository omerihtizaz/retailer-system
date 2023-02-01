import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninAdminDto {
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @IsString()
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
