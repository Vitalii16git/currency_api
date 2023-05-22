import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BinancePaginationParams {
  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  per_page?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => String)
  @Min(0)
  search?: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => String)
  @Min(0)
  sort?: string;
}
