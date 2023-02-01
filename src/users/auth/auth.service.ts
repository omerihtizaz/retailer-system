import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Equal, Repository } from 'typeorm';
import { RetailerService } from 'src/retailer/retailer.service';
import { UnauthorizedUsers } from '../entity/unauthorized.user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminService } from 'src/admin/admin.service';
const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UnauthorizedUsers)
    private unauthorisedRepo: Repository<UnauthorizedUsers>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtTokenService: JwtService,
    private retailerService: RetailerService,
    private adminService: AdminService,
  ) {}
  async signup(
    name: string,
    email: string,
    password: string,
    user_retailer_admin: number,
  ) {
    var user;
    if (user_retailer_admin == 1) {
      user = await this.userService.find(email);
    } else if (user_retailer_admin == 0) {
      user = await this.retailerService.find(email);
    } else {
      user = await this.adminService.find(email);
    }
    if (user.length) {
      throw new BadRequestException('Email already exist');
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const password_ = salt + '.' + hash.toString('hex');
    if (user_retailer_admin == 1) {
      var UA_u = await this.unauthorisedRepo.create({
        name: name,
        email: email,
        password: password_,
        isUser: true,
      });
      return this.unauthorisedRepo.save(UA_u);
    } else if (user_retailer_admin == 0) {
      var UA_u = await this.unauthorisedRepo.create({
        name: name,
        email: email,
        password: password_,
        isUser: false,
      });
      return this.unauthorisedRepo.save(UA_u);
    } else {
      return await this.adminService.create(name, email, password_);
    }
  }
  // user = 1
  // retailer = 0
  // admin = -1
  async signin(email: string, password: string, user_retailer_admin: number) {
    var logger;
    if (user_retailer_admin == 1) {
      logger = await this.userService.find(email);
    } else if (user_retailer_admin == 0) {
      logger = await this.retailerService.find(email);
    } else {
      logger = await this.adminService.find(email);
    }
    logger = logger[0];
    if (!logger) {
      throw new NotFoundException(
        'Email or Password incorrect. Please try again',
      );
    }
    const [salt, storedhash] = logger.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedhash === hash.toString('hex')) {
      const payload = { username: logger.email, sub: logger.id };
      console.log('auth service: payload = ', payload);
      return this.jwtTokenService.sign(payload);
    } else {
      throw new NotFoundException(
        'Email or Password incorrect. Please try again',
      );
    }
  }
}
