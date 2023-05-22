import { BybitCurrencyEntity } from './../db/entities/bybit.currency.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './../db/entities/user.entity';
import { Module } from '@nestjs/common';
import { BybitService } from './bybit.service';
import { BybitController } from './bybit.controller';

@Module({
  controllers: [BybitController],
  providers: [BybitService],
  exports: [BybitService],
  imports: [
    TypeOrmModule.forFeature([BybitCurrencyEntity, UserEntity]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
})
export class BybitModule {}
