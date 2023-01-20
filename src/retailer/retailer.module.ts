import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from 'src/constants';
import { UsersModule } from 'src/users/users.module';
import { Retailer } from './entity/retailer.entity';
import { RetailerController } from './retailer.controller';
import { RetailerService } from './retailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Retailer]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [RetailerController],
  providers: [RetailerService, BigQuery, Storage],
  exports: [RetailerService],
})
export class RetailerModule {}
