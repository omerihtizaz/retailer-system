import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { ConsumerService } from './kafka/consumer.service';

@Injectable()
export class TestConsumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private bigqueryClient: BigQuery,
    private gc: Storage,
  ) {}

  async onModuleInit() {
    this.bigqueryClient = new BigQuery({
      keyFilename: 'src/retailer-system-373507-bfc365c8f458.json',
      projectId: 'retailer-system-373507',
    });
    this.gc = new Storage({
      keyFilename: 'src/retailer-system-373507-bfc365c8f458.json',
      projectId: 'retailer-system-373507',
    });
    await this.consume();
  }
  async updateBucket(
    retailer_id: Number,
    type_item: String,
    name_item: String,
    body: any,
  ) {
    const file = this.gc
      .bucket(`retailer-system`)
      .file(
        `data/retailers/${retailer_id}/${type_item}/${retailer_id}-${type_item}-${name_item}.json`,
      );
    var ITEM_ID = Math.floor(
      100000 + Math.random() * Math.floor(100000 + Math.random() * 900000),
    );

    body.ITEM_ID = ITEM_ID;
    var data = Buffer.from(JSON.stringify(body));
    console.log(JSON.stringify(body));
    file.save(data, function (err) {
      if (!err) {
        console.log(`Successfully uploaded ${fileName}`);
      }
    });
    file.save(data).then(function () {});
    let fileName = `${retailer_id}/${type_item}/${retailer_id}-${type_item}-${name_item}.json`;

    const fileUpload = this.gc.bucket('retailer-system').file(fileName);

    const uploadStream = fileUpload.createWriteStream({});

    uploadStream.on('finish', () => {
      console.log('Upload success');
    });
  }
  async consume() {
    await this.consumerService.consume(
      { topics: ['test'] },
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

          var query = `UPDATE \`retailer-system-373507.Retailer_System.data\`
          SET ITEM_QUANTITY = ITEM_QUANTITY - @quantity
          WHERE retailer_id = @retailer_id and item_id = @item_id`;
          var params = {} as any;
          params.item_id = item_id;
          params.retailer_id = retailer_id;
          params.quantity = quantity;
          console.log(data);
          const [job] = await this.bigqueryClient.createQueryJob({
            query: query,
            params: params,
          });
          const result = await job.getQueryResults();
          console.log(result);
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
