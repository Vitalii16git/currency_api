import { Module } from '@nestjs/common';
import { ParseService } from './parse.service';
import { ParseController } from './parse.controller';

@Module({
  controllers: [ParseController],
  providers: [ParseService]
})
export class ParseModule {}
