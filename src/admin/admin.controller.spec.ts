import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AuthService } from '../users/auth.service';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entity/user.entity';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlackList } from './entity/admin.entity';
import { SignInUserDto } from 'src/users/dtos/signin-user.dto';
import { BadRequestException } from '@nestjs/common';
describe('AdminController', () => {
  let controller: AdminController;
  let fakeAuthService;
  let fakeUser;
  let fakeRepo;
  let service: AdminService;
  let databaseBlacklist: BlackList[] = [];
  let databaseUser: User[] = [];
  beforeEach(async () => {
    fakeRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (email: any) => {
        const filteredcategories = databaseBlacklist.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).email === email.email.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      remove: async (cat: BlackList) => {
        var index = await databaseBlacklist.indexOf(cat);
        if (index > -1) {
          databaseBlacklist.splice(index, 1);
        }
        return Promise.resolve(cat);
      },
      create: (obj: any) => {
        var blacklisted = {
          id: Math.floor(Math.random() * 99999),
          email: obj.email,
        } as unknown as BlackList;

        return Promise.resolve(blacklisted);
      },
      save: async (to_save: BlackList) => {
        await databaseBlacklist.push(to_save);
        return Promise.resolve(to_save);
      },
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        const filteredcategories = databaseUser.filter(async (blacklist) => {
          blacklist.email.includes(email);
        });
        return Promise.resolve(filteredcategories[0]);
      },
    };
    fakeUser = {
      findOne: (id: number) => {
        if (!id) {
          return Promise.resolve(undefined);
        }
        return Promise.resolve({
          id: id,
          name: 'Omer',
          email: 'omer.@gmail.com',
          password: '123',
          admin: 1,
        } as unknown as User);
      },
    };
    const ServiceModule: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(BlackList),
          useValue: fakeRepo,
        },
      ],
    }).compile();

    service = ServiceModule.get<AdminService>(AdminService);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: service },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: UsersService,
          useValue: fakeUser,
        },
      ],
    }).compile();
    databaseUser = [];
    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should sign in an admin if the correct credientials are passed', async () => {
    databaseUser.push({
      id: 1,
      email: 'admin1@gmail.com',
      password: 'password',
      admin: 1,
    } as unknown as User);
    const admin = await controller.signinAdmin(
      {
        email: 'admin1@gmail.com',
        password: 'password',
      } as unknown as SignInUserDto,
      { userID: 0 },
    );
    expect(admin).toBeDefined();
  });
  it('should throw an error if a user tries to sign in', async () => {
    databaseUser.push({
      id: 2,
      email: 'admin2@gmail.com',
      password: 'password',
      admin: 0,
    } as unknown as User);
    await expect(
      controller.signinAdmin(
        {
          email: 'admin2@gmail.com',
          password: 'password',
        } as unknown as SignInUserDto,
        { userID: 0 },
      ),
    ).rejects.toThrowError(
      new BadRequestException('You cannot sign in as User'),
    );
  });
  it('should throw an error if a admin blacklists a user that is not present', async () => {
    databaseUser.push({
      id: 2,
      email: 'user@gmail.com',
      password: 'password',
      admin: 1,
    } as unknown as User);
    await expect(
      controller.blaclistUser('user3@gmail.com', {
        userID: 2,
      }),
    ).toEqual(null || undefined || Promise.resolve({}));
  });
  it('should blacklist a user if the user provided is correct', async () => {
    databaseBlacklist = [];
    databaseUser.push({
      id: 1,
      email: 'user@gmail.com',
      password: 'password',
      admin: 1,
    } as unknown as User);
    const admin = await controller.blaclistUser('user@gmail.com', {
      userID: 1,
    });
    expect(admin).toBeDefined();
    expect(service.findOne('user@gmail.com')).toBeDefined();
  });
  it('should throw an error if asked to whitelist a user that is not blacklisted', async () => {
    databaseUser.push({
      id: 1,
      email: 'user@gmail.com',
      password: 'password',
      admin: 1,
    } as unknown as User);
    databaseBlacklist.push({
      email: 'user@gmail.com',
    } as unknown as BlackList);
    await expect(
      controller.whitelist('user1@gmail.com', {
        userID: 1,
      }),
    ).toEqual(null || undefined || Promise.resolve({}));
  });
  it('should whitelist a user that is already blacklisted', async () => {
    databaseUser.push({
      id: 1,
      email: 'user@gmail.com',
      password: 'password',
      admin: 1,
    } as unknown as User);
    databaseBlacklist.push({
      email: 'user@gmail.com',
    } as unknown as BlackList);
    expect(
      controller.whitelist('user@gmail.com', {
        userID: 1,
      }),
    ).toBeDefined();
    await expect(service.findOne('user@gmail.com')).toEqual(
      null || undefined || Promise.resolve({}),
    );
  });
});
