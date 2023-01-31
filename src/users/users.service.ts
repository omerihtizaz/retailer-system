import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Equal, Repository } from 'typeorm';
import { ProducerService } from 'src/kafka/producer.service';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import { BUCKET_NAME } from 'src/retailer/constants';
import {
  GET_ITEMS_TYPE_RETAILER,
  LIST_ALL_ITEMS_BQUERY,
} from 'src/bigQuery/query';
import { createRandomOrderID } from 'src/utility.functions';
import { CONSUMER_TOPIC } from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly producerService: ProducerService,
    @InjectRepository(User) private UserRepo: Repository<User>,
    private gc: GoogleStorageService,
    private bigQueryService: biqQueryService,
  ) {}
  // this will create the user and then save it to the UserRepository
  async create(name: string, email: string, password: string) {
    var user = await this.UserRepo.create({ name, email, password });
    return this.UserRepo.save(user);
  }
  async computePrice(body: any, number_items: number) {
    var price = 0;
    var type_name = [];
    for (var i = 0; i < number_items; i += 1) {
      var query = GET_ITEMS_TYPE_RETAILER;
      var params = {} as any;
      params.RETAILER_ID = body[i.toString()][1];
      params.ITEM_ID = body[i.toString()][0];

      const [rows] = await this.bigQueryService.createAndExecute(query, params);
      price += rows[0].ITEM_PRICE * body[i.toString()][2];
      type_name.push(rows[0]);
    }

    return [price, type_name];
  }
  async getFiles(files) {
    var orders = [];
    for (var i = 0; i < files.length; i++) {
      var row = await this.gc.getFiles(BUCKET_NAME, files[i].name);
      orders.push(JSON.parse(row[0].toString('utf8')));
    }
    return Promise.resolve(orders);
  }
  async getAllOrders(user_id: Number) {
    const files = await this.gc.getMultipleFiles(
      BUCKET_NAME,
      `orders/users/${user_id}`,
    );
    var orders = await this.getFiles(files[0]);
    return Promise.resolve(orders);
  }

  async getOneOrder(user_id: Number, order_id: Number) {
    var row = await this.gc.getFiles(
      BUCKET_NAME,
      `orders/users/${user_id}/${user_id} - ${order_id}.json`,
    );
    return Promise.resolve(row[0]);
  }
  async createOrder(user_id: Number, body: any) {
    var number_items = body.number_items;
    delete body.number_items;
    var ORDER_ID = createRandomOrderID();
    var path = `orders/users/${user_id}/${user_id} - ${ORDER_ID}.json`;
    var [price, type_name] = await this.computePrice(body, number_items);
    body.price = price;
    body.rows = type_name;
    var data = Buffer.from(JSON.stringify(body));
    let fileName = `${user_id}/${user_id} - ${ORDER_ID}.json`;
    await this.gc.createOrder(BUCKET_NAME, path, data, fileName);
    await this.producerService.produce({
      topic: CONSUMER_TOPIC,
      messages: [{ value: JSON.stringify(body) }],
    });
    return Promise.resolve('Order placed successfully');
  }
  async listallItemsBQ() {
    var query = LIST_ALL_ITEMS_BQUERY;
    var params = {} as any;
    const rows = await this.bigQueryService.createAndExecute(query, params);
    return rows;
  }
  // this will find a user by their id.
  async findOne(id: number) {
    if (id == null) {
      return null;
    }
    var user = await this.UserRepo.findOneBy({ id: id });
    if (!user) {
      return undefined;
    }
    return user;
  }
  // this will find a user by their email
  async find(email: string) {
    return await this.UserRepo.find({ where: { email: Equal(email) } });
  }

  // this will remove the user by their rid, and if there is no user,
  // it will throw an error
  async remove(id: number) {
    var user = await this.UserRepo.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    return this.UserRepo.remove(user);
  }
}
