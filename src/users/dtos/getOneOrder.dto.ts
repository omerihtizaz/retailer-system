import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class getOneOrderDto {
  @IsNumber()
  @ApiProperty({ type: Number, description: 'Order Id' })
  order_id: Number;
}
