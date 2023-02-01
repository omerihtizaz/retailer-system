import { Test, TestingModule } from '@nestjs/testing';
import { RetailerController } from './retailer.controller';

describe('RetailerController', () => {
  let controller: RetailerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetailerController],
    }).compile();

    controller = module.get<RetailerController>(RetailerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
