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
import { RetailerService } from 'src/retailer/retailer.service';
// import { AdminService } from 'src/admin/admin.service';
// import { AdminService } from '.../';
const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private jwtTokenService: JwtService,
    private retailerService: RetailerService,
  ) {}
  async signup(name: string, email: string, password: string) {
    var user = await this.userService.find(email);
    if (user.length) {
      throw new BadRequestException('Email already exist');
    }
    // var blacklisted = await this.adminService.findOne(email);
    // if (blacklisted) {
    //   throw new BadRequestException('Please contact customer service!');
    // }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const password_ = salt + '.' + hash.toString('hex');
    return { name, email, password_ };
  }
  async signin(email: string, password: string, retailer: boolean) {
    var logger;
    if (!retailer) {
      logger = await this.userService.find(email);
      logger = logger[0];
    } else {
      logger = await this.retailerService.find(email);
      logger = logger[0];
    }
    if (!logger) {
      throw new NotFoundException(
        'Email or Password incorrect. Please try again',
      );
    }
    console.log(logger.password);
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
