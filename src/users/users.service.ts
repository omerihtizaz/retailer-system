import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Equal, Repository } from 'typeorm';
import { Storage } from '@google-cloud/storage';
import { BigQuery } from '@google-cloud/bigquery';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { ProducerService } from 'src/kafka/producer.service';
import { ReturnItemDto } from './dtos/return-item.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly producerService: ProducerService,
    @InjectRepository(User) private UserRepo: Repository<User>,
    private gc: Storage,
    private bigqueryClient: BigQuery,
  ) {}
  async onModuleInit() {
    this.gc = new Storage({
      keyFilename: 'src/retailer-system-373507-bfc365c8f458.json',
      projectId: 'retailer-system-373507',
    });

    this.bigqueryClient = new BigQuery({
      keyFilename: 'src/retailer-system-373507-bfc365c8f458.json',
      projectId: 'retailer-system-373507',
    });
  }

  // this will create the user and then save it to the UserRepository
  async create(name: string, email: string, password: string) {
    var user = await this.UserRepo.create({ name, email, password });
    return this.UserRepo.save(user);
  }
  async computePrice(body: any, number_items: number) {
    var price = 0;
    var type_name = [];
    for (var i = 0; i < number_items; i += 1) {
      var query = `SELECT * FROM \`retailer-system-373507.Retailer_System.data\` WHERE RETAILER_ID = @RETAILER_ID AND ITEM_ID = @ITEM_ID`;
      var params = {} as any;
      params.RETAILER_ID = body[i.toString()][1];
      params.ITEM_ID = body[i.toString()][0];

      const [job] = await this.bigqueryClient.createQueryJob({
        query: query,
        params,
      });
      const [rows] = await job.getQueryResults();
      console.log(rows);
      price += rows[0].ITEM_PRICE * body[i.toString()][2];
      type_name.push(rows[0]);
    }

    return [price, type_name];
  }
  async getFiles(files) {
    var orders = [];
    for (var i = 0; i < files.length; i++) {
      var row = await this.gc
        .bucket('retailer-system')
        .file(files[i].name)
        .download();
      orders.push(JSON.parse(row[0].toString('utf8')));
    }
    return Promise.resolve(orders);
  }
  async getAllOrders(user_id: Number) {
    const files = await this.gc
      .bucket(`retailer-system`)
      .getFiles({ prefix: `orders/users/${user_id}` });
    var orders = await this.getFiles(files[0]);
    return Promise.resolve(orders);
  }

  async getOneOrder(user_id: Number, order_id: Number) {
    var row = await this.gc
      .bucket('retailer-system')
      .file(`orders/users/${user_id}/${user_id} - ${order_id}.json`)
      .download();
    return Promise.resolve(row[0]);
  }
  async createOrder(user_id: Number, body: any) {
    var number_items = body.number_items;
    delete body.number_items;
    var ORDER_ID = Math.floor(
      100000 + Math.random() * Math.floor(100000 + Math.random() * 900000),
    );
    const file = this.gc
      .bucket(`retailer-system`)
      .file(`orders/users/${user_id}/${user_id} - ${ORDER_ID}.json`);
    var [price, type_name] = await this.computePrice(body, number_items);

    body.price = price;
    body.rows = type_name;
    var data = Buffer.from(JSON.stringify(body));
    file.save(data, function (err) {
      if (!err) {
        console.log(`Successfully uploaded ${fileName}`);
      }
    });
    file.save(data).then(function () {});
    let fileName = `${user_id}/${user_id} - ${ORDER_ID}.json`;

    const fileUpload = this.gc.bucket('retailer-system').file(fileName);

    const uploadStream = fileUpload.createWriteStream({});

    uploadStream.on('finish', () => {
      console.log('Upload success');
    });
    await this.producerService.produce({
      topic: 'test',
      messages: [{ value: JSON.stringify(body) }],
    });
    return Promise.resolve('Order placed successfully');
  }
  async listallItemsBQ() {
    var query = `SELECT * FROM \`retailer-system-373507.Retailer_System.data\``;
    const [job] = await this.bigqueryClient.createQueryJob(query);
    const [rows] = await job.getQueryResults();
    return rows as ReturnItemDto[];
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
