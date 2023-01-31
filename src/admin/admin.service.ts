import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import {
  DELETE_DATA_UNAPPROVED,
  GET_ALL_UNAPPROVED_DATA,
  GET_ITEM_UNAPPROVED_DATA,
  SCHEMA,
} from 'src/bigQuery/query';
import { LOCATION } from 'src/constants';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';
import {
  APPROVED_DATASET_NAME,
  BUCKET_NAME,
  TABLE_NAME,
} from 'src/retailer/constants';
import { Retailer } from 'src/retailer/entity/retailer.entity';
import { UnauthorizedUsers } from 'src/users/entity/unauthorized.user.entity';
import { User } from 'src/users/entity/user.entity';
import { Equal, Repository } from 'typeorm';
import { Admin } from './entity/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private repo: Repository<Admin>,
    @InjectRepository(UnauthorizedUsers)
    private unauthorisedUsers: Repository<UnauthorizedUsers>,
    @InjectRepository(Retailer)
    private retailerRepo: Repository<Retailer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private bigQueryService: biqQueryService,
    private googleCloudService: GoogleStorageService,
  ) {}

  async create(name: String, email: String, password: String) {
    var retailer = await this.repo.create({ name, email, password });
    return this.repo.save(retailer);
  }
  async getPendingItems() {
    return await this.bigQueryService.createAndExecute(
      GET_ALL_UNAPPROVED_DATA,
      {},
    );
  }
  async getPendingConsumers() {
    return await this.unauthorisedUsers
      .createQueryBuilder()
      .select('*')
      .getRawMany();
  }
  async rejectPendingItem(id: Number) {
    const query = DELETE_DATA_UNAPPROVED;
    const params = {} as any;
    params.item_id = id;
    await this.bigQueryService.createAndExecute(query, params);
    return id;
  }
  async rejectPendingItems(id: Number[]) {
    var to_return: Number[] = [];
    id.forEach(async (item_id) => {
      to_return.push(await this.rejectPendingItem(item_id));
    });
    return Promise.resolve('IDs are rejected!');
  }
  async approvePendingItem(id: Number) {
    var query = GET_ITEM_UNAPPROVED_DATA;
    const params = {} as any;
    params.item_id = id;
    const [rows] = await this.bigQueryService.createAndExecute(query, params);
    await this.googleCloudService.addDataToBucket(
      BUCKET_NAME,
      rows[0].RETAILER_ID,
      rows[0].ITEM_TYPE,
      rows[0].ITEM_NAME,
      rows[0].ITEM_ID,
      rows[0],
    );
    await this.bigQueryService.addData(APPROVED_DATASET_NAME, TABLE_NAME, rows);
    query = DELETE_DATA_UNAPPROVED;
    await this.bigQueryService.createAndExecute(query, params);
    return id;
  }
  async approvePendingItems(id: Number[]) {
    var to_return: Number[] = [];
    id.forEach(async (item_id) => {
      to_return.push(await this.approvePendingItem(item_id));
    });
    return Promise.resolve('IDs are approved!');
  }
  async approvePendingConsumer(id: Number) {
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
      return await this.userRepo.save(addedUser);
    } else {
      var addedRetailer = await this.retailerRepo.create({
        name: user['name'],
        email: user['email'],
        password: user['password'],
      });
      await this.unauthorisedUsers.remove(user);
      return await this.retailerRepo.save(addedRetailer);
    }
  }
  async createTable(datasetName: string, tableName: string) {
    const schema = SCHEMA;
    const location = LOCATION;
    const options = { location, schema };
    var tableId = await this.bigQueryService.createTable(
      datasetName,
      tableName,
      options,
    );
    Promise.resolve('Created Table with id: ' + tableId);
  }

  find(email: string) {
    return this.repo.find({ where: { email: Equal(email) } });
  }
  async findOne(email: String) {
    if (!email) {
      return null;
    }
    var user = await this.repo.findOneBy({ email: Equal(email) });
    return user;
  }
}