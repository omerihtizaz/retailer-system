import { IsString, IsNumber, Min, Max, IsArray, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetItemBucket {
  @IsString()
  @ApiProperty({ type: String, description: 'item type' })
  type: String;
  @IsString()
  @ApiProperty({ type: String, description: 'name' })
  name: String;
}
