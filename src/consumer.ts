import { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { biqQueryService } from './bigQuery/bigQuery.service';
import { UPDATE_DATA_BIGQUERY } from './bigQuery/query';
import { CONSUMER_TOPIC } from './constants';
import { GoogleStorageService } from './GoogleStorage/GoogleStorageService';
import { ConsumerService } from './kafka/consumer.service';
import { BUCKET_NAME } from './retailer/constants';
import { createRandomOrderID } from './utility.functions';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private gc: GoogleStorageService,
    private bigQueryService: biqQueryService,
  ) {}

  async onModuleInit() {
    await this.consume();
  }
  async updateBucket(
    retailer_id: number,
    type_item: String,
    name_item: String,
    body: any,
  ) {
    var ITEM_ID = createRandomOrderID();
    body.ITEM_ID = ITEM_ID;
    var data = Buffer.from(JSON.stringify(body));
    this.gc.addDataToBucket(
      BUCKET_NAME,
      retailer_id,
      type_item,
      name_item,
      ITEM_ID,
      data,
    );
  }
  async consume() {
    await this.consumerService.consume(
      { topics: [CONSUMER_TOPIC] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          var data = JSON.parse(message.value.toString());
          var retailer_id = data['0'][1];
          var item_id = data['0'][0];
          var quantity = data['0'][2];
          var rows = data.rows[0];
          rows.ITEM_QUANTITY -= quantity;
          await this.updateBucket(
            retailer_id,
            rows.ITEM_TYPE,
            rows.ITEM_NAME,
            rows,
          );

          var query = UPDATE_DATA_BIGQUERY;
          var params = {} as any;
          params.item_id = item_id;
          params.retailer_id = retailer_id;
          params.quantity = quantity;
          await this.bigQueryService.createAndExecute(query, params);
          console.log({
            Message: JSON.parse(message.value.toString()),
            topic: topic.toString(),
            partition: partition.toString(),
          });
        },
      },
    );
  }
}
