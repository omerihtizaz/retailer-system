import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
export class ApprovePendingConsumerDTO {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'ID' })
  id: number;
}
