import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { biqQueryService } from 'src/bigQuery/bigQuery.service';
import { jwtConstants } from 'src/constants';
import { GoogleStorageService } from 'src/GoogleStorage/GoogleStorageService';
import { UsersModule } from 'src/users/users.module';
import { EXPIRE_TOKEN } from './constants';
import { Retailer } from './entity/retailer.entity';
import { RetailerController } from './retailer.controller';
import { RetailerService } from './retailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Retailer]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: EXPIRE_TOKEN },
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [RetailerController],
  providers: [RetailerService, biqQueryService, GoogleStorageService],
  exports: [RetailerService],
})
export class RetailerModule {}
