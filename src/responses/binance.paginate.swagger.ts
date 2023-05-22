import { BinanceCurrencyEntity } from '../db/entities/binance.currency.entity';
import { ApiProperty } from '@nestjs/swagger';

class Pagination {
  @ApiProperty()
  per_page: number;
  @ApiProperty()
  offset: number;
  @ApiProperty()
  with: string;
  @ApiProperty()
  total: number;
}

export class BinancePaginateSwaggerResponse {
  @ApiProperty()
  pagination: Pagination;
  @ApiProperty({ isArray: true })
  data: BinanceCurrencyEntity;
}
