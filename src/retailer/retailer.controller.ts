import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from 'src/users/auth/auth.service';
import { JwtAuthGuard } from 'src/users/auth/jwt.authGuard';
import { CreateRetailerDto } from './dto/create-retailer.dto';
import { LoginRetailerDto } from './dto/login-retailer.dto';
import { RetailerService } from './retailer.service';
import { CreateItemDto } from './dto/create-item.dto';
import { GetItemBucket } from './dto/get-item-bucket.dto';
@Controller('retailer')
@ApiBearerAuth('access-token')
export class RetailerController {
  constructor(
    private authService: AuthService,
    private retailerService: RetailerService,
  ) {}

  @Post('/v1.0/signup')
  @ApiBody({ type: CreateRetailerDto })
  @ApiCreatedResponse({ description: "Retailer's Sign Up Portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signup' })

  // this function will create an retailer
  // it will then use authentication retailer to check if the retailer fulfills all the necessary requirements to sign up
  // if it does, it will create the retailer, or throw a necessary error
  async createRetailer(@Body() body: CreateRetailerDto) {
    var { name, email, password_ } = await this.authService.signup(
      body.name,
      body.email,
      body.password,
    );
    var retailer = await this.retailerService.create(name, email, password_);
    return {
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      retailer_email: retailer.email,
    };
  }
  @Post('/v1.0/signin')
  @ApiOkResponse({ description: "Retailer's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: LoginRetailerDto })
  // this will take a dto as input,
  // and use the authentication system to check for the necessary authentication requirements.
  // if the user fulfilles, it will sign it up and initialise the session
  async signinUser(@Body() body: LoginRetailerDto) {
    var user = await this.authService.signin(body.email, body.password, true);
    return user;
  }

  @Post('/v1.0/create-item')
  @ApiOkResponse({ description: "Retailer's portal to create an item" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: CreateItemDto })
  async createItem(@Body() body: CreateItemDto, @Request() req) {
    const retailer_id = req.user.sub;
    const type_item = body.type;
    const name_item = body.name;
    const quantity_item = body.quantity;
    const price_item = body.price;
    const brand_item = body.brand;
    return await this.retailerService.createItem(
      retailer_id,
      type_item,
      name_item,
      body,
      quantity_item,
      brand_item,
      price_item,
    );
  }
  @Get('/v1.0/get-item-bucket')
  @ApiOkResponse({
    description: "Retailer's portal to get an item from buckets",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  async getItemBucket(@Body() body: GetItemBucket, @Request() req) {
    return this.retailerService.getitembucket(body, req);
  }

  @Get('/v1.0/get-item-bigquery-retailer')
  @ApiOkResponse({
    description: "Retailer's portal to get an item from big query table",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  async getItemBQwrtRetailer(@Request() req) {
    return this.retailerService.getItemBQwrtRetailer(req.user.sub);
  }
  @Get('/v1.0/get-item-bigquery-type')
  @ApiOkResponse({
    description: "Retailer's portal to get an item as a type from bigquery",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  async getItemBQwrtType(@Request() req, @Body() body: GetItemBucket) {
    var type = body.type;
    var name = body.name;
    return this.retailerService.getItemBQwrtType(type, name);
  }
  @Get('/v1.0/list-all-item-bigquery')
  @ApiOkResponse({
    description: "Retailer's portal to get all items from bigquery",
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @UseGuards(JwtAuthGuard)
  async listallItemBigquery() {
    return this.retailerService.listallItemsBQ();
  }
  @ApiOkResponse({ description: 'Find One Retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/v1.0/findone/:id')
  // this will return a Retailer by their id
  async findOne(@Param('id') id: number) {
    return await this.retailerService.findOne(id);
  }

  @Get('/v1.0/whoami')
  @ApiOkResponse({ description: 'Find One Retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @UseGuards(JwtAuthGuard)
  getUserInfo(@Request() req) {
    console.log(req.user);
    return Promise.resolve(req.user);
  }

  @ApiOkResponse({ description: "Retailer's Sign Out portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signout' })
  @Get('/v1.0/logout')
  // this will logout the Retailer
  async logout() {
    return Promise.resolve('Logged Out Successfully');
  }
  @Get('/v1.0/find/:email')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Get retailer based on email' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  // this will find a user
  async find(@Param('email') email: string) {
    return await this.retailerService.find(email);
  }
  @ApiOkResponse({ description: 'Remove retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  @Get('/v1.0/remove/:id')
  // this will remove the user.
  async remove(@Param('id') id: number) {
    return this.retailerService.remove(id);
  }
}
