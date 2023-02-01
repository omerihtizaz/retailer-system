import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RetailerModule } from './retailer/retailer.module';
import { Consumer } from './consumer';
import { ConsumerService } from './kafka/consumer.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { biqQueryService } from './bigQuery/bigQuery.service';
import { GoogleStorageService } from './GoogleStorage/GoogleStorageService';
import { AdminModule } from './admin/admin.module';
import { Admin } from './admin/entity/admin.entity';
import { UnauthorizedUsers } from './users/entity/unauthorized.user.entity';
import { Retailer } from './retailer/entity/retailer.entity';
import { User } from './users/entity/user.entity';

const cookieSession = require('cookie-session');
const settings = require('../ormconfig.js');
@Module({
  imports: [
    PrometheusModule.register({}),
    TypeOrmModule.forFeature([Admin]),
    TypeOrmModule.forFeature([UnauthorizedUsers]),
    TypeOrmModule.forFeature([Retailer]),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    UsersModule,
    RetailerModule,
    AdminModule,
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
    Consumer,
    ConsumerService,
    biqQueryService,
    GoogleStorageService,
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
