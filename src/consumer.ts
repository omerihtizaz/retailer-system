import { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { biqQueryService } from './bigQuery/bigQuery.service';
import { UPDATE_DATA_BIGQUERY } from './bigQuery/query';
import { APPROVE_CUSTOMER, CONSUMER_TOPIC, REJECT_CUSTOMER } from './constants';
import { GoogleStorageService } from './GoogleStorage/GoogleStorageService';
import { ConsumerService } from './kafka/consumer.service';
import { BUCKET_NAME } from './retailer/constants';
import { UnauthorizedUsers } from './users/entity/unauthorized.user.entity';
import { createRandomOrderID } from './utility.functions';
import { Repository } from 'typeorm';
import { User } from './users/entity/user.entity';
import { Retailer } from './retailer/entity/retailer.entity';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private gc: GoogleStorageService,
    private bigQueryService: biqQueryService,
    @InjectRepository(UnauthorizedUsers)
    private unauthorisedUsers: Repository<UnauthorizedUsers>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Retailer)
    private retailerRepo: Repository<Retailer>,
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
    // this consumer will listen to topics which will approve a consumer,
    // approval will check is the consumer is a user or a retailer
    // once confirmed, it will add that consumer to respective table and remove the row from the
    // unapproved consumer's list
    await this.consumerService.consume(
      { topics: [APPROVE_CUSTOMER] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          var id = JSON.parse(message.value.toString());
          var user = await this.unauthorisedUsers
            .createQueryBuilder()
            .select('*')
            .andWhere('id = :id', { id })
            .getRawMany();
          user = user[0];
          if (user['isUser']) {
            var addedUser = await this.userRepo.create({
              name: user['name'],
              email: user['email'],
              password: user['password'],
            });
            await this.userRepo.save(addedUser);
          } else {
            var addedRetailer = await this.retailerRepo.create({
              name: user['name'],
              email: user['email'],
              password: user['password'],
            });
            await this.retailerRepo.save(addedRetailer);
          }
          await this.unauthorisedUsers.remove(user);
          console.log({
            Message: JSON.parse(message.value.toString()),
            topic: topic.toString(),
            partition: partition.toString(),
          });
        },
      },
      'group01',
    );

    // this consumer will reject a customer, which will include removing the user from the unapprovedList
    await this.consumerService.consume(
      { topics: [REJECT_CUSTOMER] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          var id = JSON.parse(message.value.toString());
          var user = await this.unauthorisedUsers
            .createQueryBuilder()
            .select('*')
            .andWhere('id = :id', { id })
            .getRawMany();
          user = user[0];
          await this.unauthorisedUsers.remove(user);
          console.log({
            Message: JSON.parse(message.value.toString()),
            topic: topic.toString(),
            partition: partition.toString(),
          });
        },
      },
      'group02',
    );

    // this will listen to a consumer topic, which will update the quantity derived from the order
    // on bigquery and google buckets
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
      'group03',
    );
  }
}
