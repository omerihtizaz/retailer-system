import {
  Param,
  Get,
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CreateUserDto } from './dtos/signup-user.dto';
import { UsersService } from './users.service';
import { SignInUserDto } from './dtos/signin-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { JwtAuthGuard } from 'src/users/auth/jwt.authGuard';

import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from 'src/users/auth/auth.service';
import { getOneOrderDto } from './dtos/getOneOrder.dto';
import { ReturnItemDto } from './dtos/return-item.dto';
import { USER_URI } from './constants';
import { JWTTOKEN } from 'src/constants';
@Serialize(UserDto)
@ApiBearerAuth(JWTTOKEN)
@Controller(USER_URI)
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('signup')
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: "User's Sign Up Portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signup' })

  // this function will create an user
  // if the person tries to sign up as an admin, it will throw an error
  // it will then use authentication user to check if the user fulfills all the necessary
  // requirements to sign up
  // if it does, it will create the user, or throw a necessary error
  async createUser(@Body() body: CreateUserDto) {
    await this.authService.signup(body.name, body.email, body.password, 1);
    return Promise.resolve("User is awaiting Admin's approval");
  }
  @Post('signin')
  @ApiOkResponse({ description: "User's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: SignInUserDto })
  // this will take a dto as input,
  // and use the authentication system to check for the necessary authentication requirements.
  // if the user fulfilles, it will sign it up and initialise the session
  async signinUser(@Body() body: SignInUserDto) {
    var user = await this.authService.signin(body.email, body.password, 1);
    return user;
  }
  @Post('list-all-item-bigquery')
  @ApiOkResponse({ description: "User's portal to view all items" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: ReturnItemDto })
  // this function will connect with google big query table and get all the items
  async listallItemBigquery() {
    var rows = await this.userService.listallItemsBQ();
    return JSON.stringify(rows);
  }
  @Post('createOrder')
  @ApiOkResponse({ description: "User's Portal for creating order" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  // this function witll create an order
  async createOrder(@Body() body: any, @Request() req: any) {
    return this.userService.createOrder(req.user.sub, body);
  }

  @Get('getMyOrders')
  @ApiOkResponse({ description: 'Get Orders of a user' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Request() req) {
    var orders = await this.userService.getAllOrders(req.user.sub);
    return JSON.stringify(orders);
  }

  @Get('getOneOrder')
  @ApiOkResponse({
    description: 'Get Single order of a user based on order Id',
  })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: getOneOrderDto })
  getOneOrder(@Param('order_id') param: getOneOrderDto, @Request() req) {
    return this.userService.getOneOrder(req.user.sub, param.order_id);
  }

  @Get('findone/:id')
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })

  // this will return a user by their id
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(id);
  }

  @Get('whoami')
  @ApiOkResponse({ description: 'Find One User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @UseGuards(JwtAuthGuard)
  getUserInfo(@Request() req) {
    return Promise.resolve(req.user);
  }

  @ApiOkResponse({ description: "User's Sign Out portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signout' })
  @Get('logout')
  // this will logout the user
  async logout() {
    return Promise.resolve('Logged Out Successfully');
  }
  @Get('find/:email')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Get Users based on email' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  // this will find a user
  async find(@Param('email') email: string) {
    return await this.userService.find(email);
  }
  @ApiOkResponse({ description: 'Remove Users' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('remove/:id')
  // this will remove the user.
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
