import { Param, Get, Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JWTTOKEN } from 'src/constants';
// import { AuthGuard } from '../guards/auth-guard';
import { AuthService } from 'src/users/auth/auth.service';
import { JwtAuthGuard } from 'src/users/auth/jwt.authGuard';
import { AdminService } from './admin.service';
import { ApprovePendingConsumerDTO } from './dtos/approve-pending-consumer.dto';
import { PendingItemsDto } from './dtos/approve-pending-items.dto';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { CreateTableDto } from './dtos/create-table.dto';
import { SigninAdminDto } from './dtos/signin-admin.dto';
@ApiBearerAuth(JWTTOKEN)
@Controller('admin/v1.0/')
export class AdminController {
  // Has an
  //  instance of auth service as authentication system for signup and signin
  //  instance of admin service to communicate with the database
  constructor(
    private authService: AuthService,
    private adminService: AdminService,
  ) {}
  @Get('rejectConsumer')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: ApprovePendingConsumerDTO })
  @ApiCreatedResponse({ description: 'Rejecting a User or Retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async rejectConsumer(@Body() body: ApprovePendingConsumerDTO) {
    await this.adminService.rejectConsumer(body.id);
  }

  @Get('approvePendingConsumer')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: ApprovePendingConsumerDTO })
  @ApiCreatedResponse({ description: 'Approving a User or Retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async approvePendingConsumer(@Body() body: ApprovePendingConsumerDTO) {
    await this.adminService.approvePendingConsumer(body.id);
  }
  @Post('signup')
  @ApiBody({ type: CreateAdminDto })
  @ApiCreatedResponse({ description: "Retailer's Sign Up Portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signup' })

  // this function will create an retailer
  // it will then use authentication retailer to check if the retailer fulfills all the necessary requirements to sign up
  // if it does, it will create the retailer, or throw a necessary error
  async createRetailer(@Body() body: CreateAdminDto) {
    return await this.authService.signup(
      body.name,
      body.email,
      body.password,
      -1,
    );
  }

  @Post('createTable')
  @ApiOkResponse({ description: "Retailer's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: CreateTableDto })
  // this will take a dto as input,
  // and use the authentication system to check for the necessary authentication requirements.
  // if the user fulfilles, it will sign it up and initialise the session
  async createTable(@Body() body: CreateTableDto) {
    return await this.adminService.createTable(
      body.dataSetName,
      body.tableName,
    );
  }

  @Post('signin')
  @ApiOkResponse({ description: "Retailer's Sign In portal" })
  @ApiUnauthorizedResponse({ description: 'Unauthorised Signin' })
  @ApiBody({ type: SigninAdminDto })
  // this will take a dto as input,
  // and use the authentication system to check for the necessary authentication requirements.
  // if the user fulfilles, it will sign it up and initialise the session
  async signinUser(@Body() body: SigninAdminDto) {
    var user = await this.authService.signin(body.email, body.password, -1);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getPendingConsumers')
  // find one method returns the blacklisted user if it exists
  @ApiAcceptedResponse({
    description: 'Get a List of all Pending Unauthorised Users and Retailers',
  })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  async getPendingConsumers() {
    return await this.adminService.getPendingConsumers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('getPendingItems')
  // find one method returns the blacklisted user if it exists
  @ApiAcceptedResponse({
    description: 'Get a List of all Pending Items',
  })
  @ApiUnauthorizedResponse({ description: 'Forbidden Access' })
  async getPendingItems() {
    return await this.adminService.getPendingItems();
  }

  @Get('approvePendingItems')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: PendingItemsDto })
  @ApiCreatedResponse({ description: 'Approve items from a retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async approvePendingItems(@Body() body: PendingItemsDto) {
    return await this.adminService.approvePendingItems(body.ids);
  }
  @Get('rejectPendingItems')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: PendingItemsDto })
  @ApiCreatedResponse({ description: 'Reject items from a retailer' })
  @ApiUnauthorizedResponse({ description: 'Forbidden Resource' })
  async rejectPendingItems(@Body() body: PendingItemsDto) {
    return await this.adminService.rejectPendingItems(body.ids);
  }

  @Get('findOne/:email')
  @UseGuards(JwtAuthGuard)
  // find one method returns the blacklisted user if it exists
  @ApiAcceptedResponse({ description: 'Find a Blacklisted User' })
  @ApiUnauthorizedResponse({ description: 'Forbidden' })
  async findOne(@Param('email') email: string) {
    return await this.adminService.findOne(email);
  }
}
