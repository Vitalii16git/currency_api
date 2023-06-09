import { Test, TestingModule } from '@nestjs/testing';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';

describe('ParseController', () => {
  let controller: ParseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParseController],
      providers: [ParseService],
    }).compile();

    controller = module.get<ParseController>(ParseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
