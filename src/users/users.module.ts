import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth/auth.service';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { JwtStrategy } from 'src/users/auth/jwt.strategy';
import { RetailerModule } from 'src/retailer/retailer.module';
import { Storage } from '@google-cloud/storage';
import { BigQuery } from '@google-cloud/bigquery';
import { ProducerService } from 'src/kafka/producer.service';
import { EXPIRE_TOKEN } from 'src/retailer/constants';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';
import { UnauthorizedUsers } from './entity/unauthorized.user.entity';
import { AdminModule } from 'src/admin/admin.module';
import { AdminService } from 'src/admin/admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UnauthorizedUsers]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: EXPIRE_TOKEN },
    }),
    forwardRef(() => RetailerModule),
    forwardRef(() => AdminModule),
  ],
  controllers: [UsersController],
  providers: [
    // AdminService,
    UsersService,
    AuthService,
    JwtStrategy,
    ProducerService,
    biqQueryService,
    GoogleStorageService,
  ],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
