import { UserEntity } from './../db/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { BinanceCurrencyEntity } from './../db/entities/binance.currency.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { BinanceController } from './binance.controller';

@Module({
  controllers: [BinanceController],
  providers: [BinanceService],
  exports: [BinanceService],
  imports: [
    TypeOrmModule.forFeature([BinanceCurrencyEntity, UserEntity]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
})
export class BinanceModule {}
