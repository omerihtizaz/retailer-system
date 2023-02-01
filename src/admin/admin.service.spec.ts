import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EqualOperator } from 'typeorm';
import { AdminService } from './admin.service';
import { BlackList } from './entity/admin.entity';
let adminService: AdminService;
var blacklistRepo;
let blacklistDatabase: BlackList[] = [];

describe('AdminService', () => {
  beforeEach(async () => {
    blacklistRepo = {
      // mock the repo `findOneOrFail`
      findOneBy: async (email: any) => {
        const filteredcategories = blacklistDatabase.filter(
          async (blacklist) =>
            (await Promise.resolve(blacklist)).email === email.email.value,
        );
        return await Promise.resolve(filteredcategories[0]);
      },
      remove: async (cat: BlackList) => {
        var index = await blacklistDatabase.indexOf(cat);
        if (index > -1) {
          blacklistDatabase.splice(index, 1);
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
        await blacklistDatabase.push(to_save);
        return Promise.resolve(to_save);
      },
    };
    const adminModule: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(BlackList),
          useValue: blacklistRepo,
        },
      ],
    }).compile();

    adminService = adminModule.get<AdminService>(AdminService);
    blacklistDatabase = [];
  });

  it('should be defined', () => {
    expect(adminService).toBeDefined();
  });
  it('should create a blacklisted user when prompted', async () => {
    const category = await adminService.blaclistUser('omer@gmail.com');
    expect(category).toBeDefined();
    expect(await adminService.findOne('omer@gmail.com')).toBeDefined();
  });
  it('should whitelist a user when prompted', async () => {
    await adminService.blaclistUser('o@gmail.com');
    const whitelistedUser = await adminService.whitelistUser('o@gmail.com');
    expect(whitelistedUser).toBeDefined();
    expect(whitelistedUser.email).toEqual('o@gmail.com');
    expect(adminService.findOne('o@gmail.com')).toEqual(
      undefined || null || Promise.resolve({}),
    );
  });
});
export { adminService, blacklistDatabase, blacklistRepo };
