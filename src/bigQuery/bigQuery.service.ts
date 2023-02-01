import { BigQuery } from '@google-cloud/bigquery';
import { OnModuleInit } from '@nestjs/common';
import { KEYFILENAME, PROJECTID } from './constants';

export class biqQueryService implements OnModuleInit {
  constructor(private bigqueryClient: BigQuery) {}
  async onModuleInit() {
    this.bigqueryClient = new BigQuery({
      keyFilename: KEYFILENAME,
      projectId: PROJECTID,
    });
  }

  async createAndExecute(query: string, params: any) {
    const [job] = await this.bigqueryClient.createQueryJob({
      query: query,
      params,
    });
    const rows = await job.getQueryResults();
    return rows;
  }
  async createTable(datasetName: string, tableName: string, options: any) {
    const table = await this.bigqueryClient
      .dataset(datasetName)
      .createTable(tableName, options);
    return table[0].id;
  }
  async addData(datasetName: string, tableName: string, rows: any) {
    await this.bigqueryClient
      .dataset(datasetName)
      .table(tableName)
      .insert(rows);
  }
}
