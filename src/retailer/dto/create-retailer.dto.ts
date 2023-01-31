import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateRetailerDto {
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: string;
  @IsEmail()
  @IsString()
  @ApiProperty({ type: String, description: 'email' })
  email: string;
  @IsString()
  @MaxLength(12)
  @MinLength(6)
  @ApiProperty({ type: String, description: 'password' })
  password: string;
}
