import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTableDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Dataset Name' })
  dataSetName: string;
  @IsString()
  @ApiProperty({ type: String, description: 'Table Name' })
  tableName: string;
}
