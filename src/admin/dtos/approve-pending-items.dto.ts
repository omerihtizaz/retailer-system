import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
export class PendingItemsDto {
  @IsArray()
  @ApiProperty({ type: Array, description: 'IDs of all items to be approved' })
  ids: number[];
}
