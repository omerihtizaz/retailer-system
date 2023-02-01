import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AdminService } from '../../admin/admin.service';
import { AuthService } from './auth.service';
import { User } from '../entity/user.entity';
import { UsersService } from '../users.service';
describe('AUTH SERVICE', () => {
  let authService: AuthService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];

    fakeUserService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (
        name: string,
        email: string,
        password: string,
        admin: number,
      ) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          name: name,
          email: email,
          password: password,
          admin: admin,
        } as unknown as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const fakeAdminService = {
      findOne: () => Promise.resolve(),
    };
    const authServiceModule = Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AdminService,
          useValue: fakeAdminService,
        },
      ],
    }).compile();
    authService = (await authServiceModule).get(AuthService);
  });
  it('can create an instance of auth authService', async () => {
    expect(authService).toBeDefined();
  });

  it('can create a new user with a salted and hashed password', async () => {
    const user = await authService.signup('Omer', 'omer@gmail.com', '123', 0);
    expect(user.password_).not.toEqual('123');

    const [salt, hash] = user.password_.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if the user wishes to signup with an email that already exisit', async () => {
    var user = await authService.signup('a', 'asdf@asdf.com', 'asdf', 0);
    await fakeUserService.create(
      user.name,
      user.email,
      user.password_,
      user.admin,
    );

    await expect(
      authService.signup('a', 'asdf@asdf.com', 'asdf', 0),
    ).rejects.toThrow(BadRequestException);
  });
  it('throws if signin is called with an unused email', async () => {
    await expect(
      authService.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    fakeUserService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'asdf@asdf.com',
          password: 'laskdjf',
          admin: 0,
        } as unknown as User,
      ]);
    await expect(
      authService.signin('laskdjf@alskdfj.com', 'passowrd'),
    ).rejects.toThrow(NotFoundException);
  });
});
