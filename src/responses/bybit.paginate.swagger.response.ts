import { BybitCurrencyEntity } from '../db/entities/bybit.currency.entity';
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

class CurrencyData {
  @ApiProperty()
  data: BybitCurrencyEntity;
}

export class BybitPaginateSwaggerResponse {
  @ApiProperty()
  pagination: Pagination;
  @ApiProperty()
  data: CurrencyData[];
}
