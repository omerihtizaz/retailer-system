import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth/auth.service';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { JwtStrategy } from './auth/jwt.strategy';
import { RetailerModule } from 'src/retailer/retailer.module';
import { Storage } from '@google-cloud/storage';
import { BigQuery } from '@google-cloud/bigquery';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProducerService } from 'src/kafka/producer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1000s' },
    }),
    forwardRef(() => RetailerModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    JwtStrategy,
    Storage,
    BigQuery,
    ProducerService,
  ],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
