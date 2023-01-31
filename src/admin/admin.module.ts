import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entity/admin.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';
import { EXPIRE_TOKEN } from 'src/retailer/constants';
import { UsersModule } from 'src/users/users.module';
import { UnauthorizedUsers } from 'src/users/entity/unauthorized.user.entity';
import { Retailer } from 'src/retailer/entity/retailer.entity';
import { User } from 'src/users/entity/user.entity';
import { GoogleStorageModule } from 'src/GoogleStorage/GoogleStorageModule';
import { bigQueryModule } from 'src/bigQuery/bigQuery.module';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    TypeOrmModule.forFeature([UnauthorizedUsers]),
    TypeOrmModule.forFeature([Retailer]),
    TypeOrmModule.forFeature([User]),

    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: EXPIRE_TOKEN },
    }),

    forwardRef(() => UsersModule),
  ],
  providers: [AdminService, biqQueryService, GoogleStorageService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
