import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RetailerModule } from './retailer/retailer.module';
import { TestConsumer } from './test.consumer';
import { ConsumerService } from './kafka/consumer.service';
import { BigQuery } from '@google-cloud/bigquery';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Storage } from '@google-cloud/storage';

const cookieSession = require('cookie-session');
const settings = require('../ormconfig.js');
@Module({
  imports: [
    PrometheusModule.register({}),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    UsersModule,
    RetailerModule,
    TypeOrmModule.forRoot(settings),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    ConfigService,
    TestConsumer,
    ConsumerService,
    BigQuery,
    Storage,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['jahsfiasf'],
        }),
      )
      .forRoutes('*');
  }
}
