import { Test, TestingModule } from '@nestjs/testing';
import { BybitController } from './bybit.controller';
import { BybitService } from './bybit.service';

describe('BybitController', () => {
  let controller: BybitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BybitController],
      providers: [BybitService],
    }).compile();

    controller = module.get<BybitController>(BybitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
