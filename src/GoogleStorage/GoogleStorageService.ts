import { Storage } from '@google-cloud/storage';
import { OnModuleInit } from '@nestjs/common';
import { KEYFILENAME, PROJECTID } from './constants';

export class GoogleStorageService implements OnModuleInit {
  constructor(private gc: Storage) {}
  async onModuleInit() {
    this.gc = new Storage({
      keyFilename: KEYFILENAME,
      projectId: PROJECTID,
    });
  }
  async getFiles(bucketName: string, path: string) {
    return await this.gc.bucket(bucketName).file(path).download();
  }
  async getMultipleFiles(bucketName: string, prefix: string) {
    const files = await this.gc.bucket(bucketName).getFiles({ prefix: prefix });
    return files;
  }
  async createFile(bucketName: string, path: string) {
    return await this.gc.bucket(bucketName).file(path);
  }
  async createOrder(BUCKET_NAME, path, data, fileName) {
    const file = this.gc.bucket(BUCKET_NAME).file(path);
    file.save(data, function (err) {
      if (!err) {
        console.log(`Successfully uploaded ${fileName}`);
      }
    });
    file.save(data).then(function () {});

    const fileUpload = this.gc.bucket(BUCKET_NAME).file(fileName);
    const uploadStream = fileUpload.createWriteStream({});
    uploadStream.on('finish', () => {
      console.log('Upload success');
    });
  }
  async addDataToBucket(
    BUCKET_NAME: string,
    retailer_id: number,
    type_item: String,
    name_item: String,
    ITEM_ID: number,
    body: any,
  ) {
    const file = this.gc
      .bucket(BUCKET_NAME)
      .file(
        `data/retailers/${retailer_id}/${type_item}/${retailer_id}-${type_item}-${name_item}.json`,
      );

    body.ITEM_ID = ITEM_ID;
    var data = Buffer.from(JSON.stringify(body));
    file.save(data, function (err) {
      if (!err) {
        console.log(`Successfully uploaded ${fileName}`);
      }
    });
    file.save(data).then(function () {});
    let fileName = `${retailer_id}/${type_item}/${retailer_id}-${type_item}-${name_item}.json`;

    const fileUpload = this.gc.bucket(BUCKET_NAME).file(fileName);

    const uploadStream = fileUpload.createWriteStream({});

    uploadStream.on('finish', () => {
      console.log('Upload success');
    });
  }
}
