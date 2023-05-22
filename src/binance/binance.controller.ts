import { BinancePaginationParams } from './../utilts/types/binance.pagination.params';
import { CurrencyChangeOrderDto } from './../dtos/currency.change.order.dto';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { BinanceCurrencyEntity } from './../db/entities/binance.currency.entity';
import { ErrorSwaggerResponse } from './../responses/error.swagger.response';
import { BinancePaginateSwaggerResponse } from './../responses/binance.paginate.swagger';
import {
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Post,
  Body,
  Req,
  Delete,
  Patch,
  Put,
} from '@nestjs/common';
import { BinanceService } from './binance.service';

@ApiTags('Binance')
@Controller('binance')
export class BinanceController {
  constructor(private readonly binanceService: BinanceService) {}

  @ApiOkResponse({
    description: 'Full currency list',
    type: BinancePaginateSwaggerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'How many currencies take from DB (if empty 10 by default)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description:
      'Start position for the users which we will take them from DB  (if empty 0 by default)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search currencies by symbol',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort currencies',
  })
  @Get()
  async getBinanceCurrencies(
    @Query() options: { per_page; offset; search; sort },
  ) {
    const result = await this.binanceService.getBinanceCurrencies(options);
    return result;
  }

  @ApiOkResponse({
    description: 'Get one currency',
    type: BinanceCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @Get(':symbol')
  async getBinanceOneCurrency(@Param('symbol') symbol: string) {
    const result = await this.binanceService.getBinanceOneCurrency(symbol);
    return result;
  }

  @ApiCreatedResponse({
    description: 'Currency list was added to the database',
    type: [BinanceCurrencyEntity],
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Post()
  async addBinanceCurrencyListToDB() {
    const result = await this.binanceService.addBinanceCurrencyListToDB();
    return result;
  }

  @ApiCreatedResponse({
    description: 'Currency was added to the list',
    type: BinanceCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiParam({ name: 'symbol' })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Post('add_curr/:symbol')
  async addBinanceOneCurrencyToDB(@Param() { symbol }: any) {
    const result = await this.binanceService.addBinanceOneCurrencyToDB({
      symbol,
    });
    return result;
  }

  @ApiOkResponse({
    description: 'Successfully deleted currency from the list',
    type: BinanceCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiParam({ name: 'symbol' })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Delete('delete_curr/:symbol')
  async deleteBinanceOneCurrencyInDB(@Param() { symbol }: any) {
    const result = await this.binanceService.deleteBinanceOneCurrencyInDB({
      symbol,
    });
    return result;
  }

  @ApiOkResponse({
    description: 'Currency list was updated',
    type: [BinanceCurrencyEntity],
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Patch('curr_list/update')
  async updateBinanceCurrencyListDB() {
    const result = await this.binanceService.updateBinanceCurrencyListDB();
    return result;
  }

  @ApiOkResponse({
    description: `Currency was added to the user's list`,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Put('add_curr_to_user/:symbol')
  async addBinanceCurrencyToUserListDB(
    @Param('symbol') symbol: string,
    @Req() req: any,
  ) {
    const result = await this.binanceService.addBinanceCurrencyToUserListDB(
      symbol,
      req.user,
    );
    return result;
  }

  @ApiOkResponse({
    description: `Successfully deleted currency from user's list`,
    type: BinanceCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Delete('delete_user_curr/:symbol')
  async deleteBinanceCurrencyFromUserListDB(
    @Param('symbol') symbol: string,
    @Req() req: any,
  ) {
    const result =
      await this.binanceService.deleteBinanceCurrencyFromUserListDB(
        symbol,
        req.user,
      );
    return result;
  }

  @ApiCreatedResponse({
    description: 'Changed currencies order',
    type: BinanceCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('assess-token')
  @Post('change_order')
  async changeBinanceCurrenciesOrder(@Body() dto: CurrencyChangeOrderDto) {
    const result = await this.binanceService.changeBinanceCurrenciesOrder(dto);
    return result;
  }
}
