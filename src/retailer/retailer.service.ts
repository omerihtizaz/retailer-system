import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Retailer } from './entity/retailer.entity';
import { Equal, Repository } from 'typeorm';
import { BIG_QUERY_TYPE, LOCATION, MODE } from 'src/constants';
import { OnModuleInit } from '@nestjs/common/interfaces/hooks';
import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
@Injectable()
export class RetailerService implements OnModuleInit {
  constructor(
    @InjectRepository(Retailer) private repo: Repository<Retailer>,
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
  // this will create the Retailer and then save it to the repository
  async create(name: string, email: string, password: string) {
    console.log(name, email, password);
    var retailer = await this.repo.create({ name, email, password });
    return this.repo.save(retailer);
  }
  async createTable() {
    const schema = [
      {
        name: 'ITEM_ID',
        type: BIG_QUERY_TYPE.INTEGER,
        mode: MODE.required,
      },
      {
        name: 'RETAILER_ID',
        type: BIG_QUERY_TYPE.INTEGER,
        mode: MODE.required,
      },
      {
        name: 'ITEM_TYPE',
        type: BIG_QUERY_TYPE.STRING,
        mode: MODE.required,
      },
      {
        name: 'ITEM_NAME',
        type: BIG_QUERY_TYPE.STRING,
        mode: MODE.required,
      },
      {
        name: 'ITEM_QUANTITY',
        type: BIG_QUERY_TYPE.INTEGER,
        mode: MODE.required,
      },
      {
        name: 'ITEM_BRAND',
        type: BIG_QUERY_TYPE.STRING,
        mode: MODE.required,
      },
      {
        name: 'ITEM_PRICE',
        type: BIG_QUERY_TYPE.INTEGER,
        mode: MODE.required,
      },
    ];
    const location = LOCATION;
    const options = { location, schema };
    const table = await this.bigqueryClient
      .dataset('Retailer_System')
      .createTable('data', options);
    Promise.resolve('Created Table with id: ' + table[0].id);
  }

  async getitembucket(body: any, req: any) {
    var path = `data/retailers/${req.user.sub}/${body.type}/${req.user.sub}-${body.type}-${body.name}.json`;
    const files = await this.gc.bucket(`retailer-system`).file(path).download();
    return JSON.parse(files[0].toString('utf8'));
  }
  async getItemBQwrtType(type: String, name: String) {
    // ITEM_TYPE =${type} AND
    var params = {} as any;
    var query = `SELECT RETAILER_ID as ID,
    ITEM_TYPE as Type,
    ITEM_NAME as  Name,
    ITEM_QUANTITY as Quantity,
    ITEM_BRAND as Brand,
    ITEM_PRICE Price,
    FROM \`retailer-system-373507.Retailer_System.data\` 
    where ITEM_NAME = @item_name  and ITEM_TYPE = @item_type`;
    params.item_name = name;
    params.item_type = type;
    const [job] = await this.bigqueryClient.createQueryJob({
      query: query,
      params,
    });
    const rows = await job.getQueryResults();
    return Promise.resolve(rows[0][0]);
  }
  async getItemBQwrtRetailer(retailer_id: Number) {
    var query = `SELECT * FROM \`retailer-system-373507.Retailer_System.data\` where RETAILER_ID = ${retailer_id}`;
    const [job] = await this.bigqueryClient.createQueryJob(query);
    const [rows] = await job.getQueryResults();
    return Promise.resolve(rows);
  }
  async listallItemsBQ() {
    var query = `SELECT * FROM \`retailer-system-373507.Retailer_System.data\``;
    const [job] = await this.bigqueryClient.createQueryJob(query);
    const [rows] = await job.getQueryResults();
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
    await this.bigqueryClient
      .dataset('Retailer_System')
      .table('data')
      .insert(rows);
    return Promise.resolve('Data entered successfully');
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
