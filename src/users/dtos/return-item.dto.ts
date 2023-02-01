import { ApiProperty } from '@nestjs/swagger';

export class ReturnItemDto {
  @ApiProperty({ type: Number, description: 'RETAILER_ID' })
  RETAILER_ID: Number;
  @ApiProperty({ type: String, description: 'ITEM_TYPE' })
  ITEM_TYPE: String;
  @ApiProperty({ type: String, description: 'ITEM_NAME' })
  ITEM_NAME: String;
  @ApiProperty({ type: Number, description: 'ITEM_QUANTITY' })
  ITEM_QUANTITY: Number;
  @ApiProperty({ type: String, description: 'ITEM_BRAND' })
  ITEM_BRAND: String;
  @ApiProperty({ type: Number, description: 'ITEM_PRICE' })
  ITEM_PRICE: Number;
  @ApiProperty({ type: Number, description: 'ITEM_ID' })
  ITEM_ID: Number;
}
