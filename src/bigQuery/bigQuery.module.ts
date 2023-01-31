import { BigQuery } from '@google-cloud/bigquery';
import { Module } from '@nestjs/common';
import { biqQueryService } from './bigQuery.service';
@Module({
  providers: [BigQuery],
  exports: [biqQueryService],
})
export class bigQueryModule {}
