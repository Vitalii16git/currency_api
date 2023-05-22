import { Test, TestingModule } from '@nestjs/testing';
import { BybitService } from './bybit.service';

describe('BybitService', () => {
  let service: BybitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BybitService],
    }).compile();

    service = module.get<BybitService>(BybitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
