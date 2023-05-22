import { Test, TestingModule } from '@nestjs/testing';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';

describe('BinanceController', () => {
  let controller: BinanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinanceController],
      providers: [BinanceService],
    }).compile();

    controller = module.get<BinanceController>(BinanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
