import { IsString, IsNumber, Min, Max, IsArray, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @IsString()
  @ApiProperty({ type: String, description: 'item type' })
  type: String;
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: String;
  @IsString()
  @ApiProperty({ type: String, description: 'brand' })
  brand: String;
  @IsNumber()
  @Min(1)
  @Max(10000)
  @ApiProperty({ type: Number, description: 'quantity' })
  quantity: Number;
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiProperty({ type: Number, description: 'price' })
  price: Number;
}
