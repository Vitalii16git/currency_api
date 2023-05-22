import { BybitService } from './bybit/bybit.service';
import { BinanceService } from './binance/binance.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(
    private readonly bybitService: BybitService,
    private readonly binanceService: BinanceService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async matchCurrencyDB() {
    const binanceResult =
      await this.binanceService.updateBinanceCurrencyListDB();
    Logger.log(binanceResult, 'Binance database updated ! ! !');
    const bybitResult = await this.bybitService.updateBybitCurrencyListDB();
    Logger.log(bybitResult, 'Bybit database updated ! ! !');
    return { 'Binance update': binanceResult, 'Bybit update': bybitResult };
  }
}
