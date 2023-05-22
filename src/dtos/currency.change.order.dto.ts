import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CurrencyChangeOrderDto {
  @ApiProperty()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsInt()
  orderDigit: number;
}
