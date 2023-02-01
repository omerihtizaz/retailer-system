import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Retailer } from './entity/retailer.entity';
import { Equal, Repository } from 'typeorm';
import {
  GET_ITEM_BQUERY_ITEM_NAME_ITEM_TYPE,
  GET_ITEM_BQUERY_RETAILER,
  LIST_ALL_ITEMS_BQUERY,
} from 'src/bigQuery/query';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';
import {
  BUCKET_NAME,
  NON_APPROVED_DATASET_NAME,
  TABLE_NAME,
} from './constants';
@Injectable()
export class RetailerService {
  constructor(
    @InjectRepository(Retailer) private repo: Repository<Retailer>,
    private gc: GoogleStorageService,
    private bigQueryService: biqQueryService,
  ) {}

  // this will create the Retailer and then save it to the repository
  async create(name: string, email: string, password: string) {
    console.log(name, email, password);
    var retailer = await this.repo.create({ name, email, password });
    return this.repo.save(retailer);
  }

  async getitembucket(body: any, req: any) {
    var path = `data/retailers/${req.user.sub}/${body.type}/${req.user.sub}-${body.type}-${body.name}.json`;
    const files = await this.gc.getFiles(BUCKET_NAME, path);
    return JSON.parse(files[0].toString('utf8'));
  }
  async getItemBQwrtType(type: String, name: String) {
    var params = {} as any;
    var query = GET_ITEM_BQUERY_ITEM_NAME_ITEM_TYPE;
    params.item_name = name;
    params.item_type = type;
    const rows = await this.bigQueryService.createAndExecute(query, params);
    console.log(rows);
    return Promise.resolve(rows[0][0]);
  }
  async getItemBQwrtRetailer(retailer_id: Number) {
    const params = {} as any;
    var query = GET_ITEM_BQUERY_RETAILER;
    params.retailer_id = retailer_id;
    const rows = await this.bigQueryService.createAndExecute(query, params);
    return Promise.resolve(rows);
  }
  async listallItemsBQ() {
    var query = LIST_ALL_ITEMS_BQUERY;
    const rows = await this.bigQueryService.createAndExecute(query, {});
    return Promise.resolve(rows);
  }
  async createItem(
    retailer_id: number,
    type_item: String,
    name_item: String,
    body: any,
    quantity_item: Number,
    brand_item: String,
    price_item: Number,
  ) {
    var ITEM_ID = Math.floor(
      100000 + Math.random() * Math.floor(100000 + Math.random() * 900000),
    );
    // await this.gc.addDataToBucket(
    //   BUCKET_NAME,
    //   retailer_id,
    //   type_item,
    //   name_item,
    //   ITEM_ID,
    //   body,
    // );

    const rows = [
      {
        retailer_id: retailer_id,
        item_type: type_item,
        item_name: name_item,
        item_quantity: quantity_item,
        item_brand: brand_item,
        item_price: price_item,
        ITEM_ID: ITEM_ID,
      },
    ];
    await this.bigQueryService.addData(
      NON_APPROVED_DATASET_NAME,
      TABLE_NAME,
      rows,
    );
    return Promise.resolve("Data is awaiting Admin's Approval ");
  }
  // this will find a retailer by their id.
  async findOne(id: number) {
    if (id == null) {
      return null;
    }
    var retailer = await this.repo.findOneBy({ id: id });
    if (!retailer) {
      return undefined;
    }
    return retailer;
  }
  // this will find a retailer by their email
  find(email: string) {
    return this.repo.find({ where: { email: Equal(email) } });
  }

  // this will remove the retailer by their rid, and if there is no retailer,
  // it will throw an error
  async remove(id: number) {
    var retailer = await this.repo.findOneBy({ id: id });
    if (!retailer) {
      throw new NotFoundException('retailer not found');
    }
    return this.repo.remove(retailer);
  }
}
