import { BybitPaginationParams } from './../utilts/types/bybit.pagination.params';
import { CurrencyChangeOrderDto } from './../dtos/currency.change.order.dto';
import { BinanceCurrencyEntity } from './../db/entities/binance.currency.entity';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { BybitCurrencyEntity } from './../db/entities/bybit.currency.entity';
import { ErrorSwaggerResponse } from './../responses/error.swagger.response';
import { BybitPaginateSwaggerResponse } from '../responses/bybit.paginate.swagger.response';
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
  Delete,
  Patch,
  Put,
  Req,
  Body,
} from '@nestjs/common';
import { BybitService } from './bybit.service';

@ApiTags('Bybit')
@Controller('bybit')
export class BybitController {
  constructor(private readonly bybitService: BybitService) {}

  @ApiOkResponse({
    description: 'Full currency list',
    type: BybitPaginateSwaggerResponse,
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
  async getBybitCurrencies(
    @Query() options: { per_page; offset; search; sort },
  ) {
    const result = await this.bybitService.getBybitCurrencies(options);
    return result;
  }

  @ApiOkResponse({
    description: 'Get one currency',
    type: BybitCurrencyEntity,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @Get(':symbol')
  async getBybitOneCurrency(@Param('symbol') symbol: string) {
    const result = await this.bybitService.getBybitOneCurrency(symbol);
    return result;
  }

  @ApiCreatedResponse({
    description: 'Currency list was added to the database',
    type: [BybitCurrencyEntity],
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
  async addBybitCurrencyListToDB() {
    const result = await this.bybitService.addBybitCurrencyListToDB();
    return result;
  }

  @ApiCreatedResponse({
    description: 'Currency was added to the list',
    type: BybitCurrencyEntity,
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
  async addBybitOneCurrencyToDB(@Param() { symbol }: any) {
    const result = await this.bybitService.addBybitOneCurrencyToDB({ symbol });
    return result;
  }

  @ApiOkResponse({
    description: 'Successfully deleted currency from the list',
    type: BybitCurrencyEntity,
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
  async deleteBybitOneCurrencyInDB(@Param() { symbol }: any) {
    const result = await this.bybitService.deleteBybitOneCurrencyInDB({
      symbol,
    });
    return result;
  }

  @ApiOkResponse({
    description: 'Currency list was updated',
    type: [BybitCurrencyEntity],
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
  async updateBybitCurrencyListDB() {
    const result = await this.bybitService.updateBybitCurrencyListDB();
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
  async addBybitCurrencyToUserListDB(
    @Param('symbol') symbol: string,
    @Req() req: any,
  ) {
    const result = await this.bybitService.addBybitCurrencyToUserListDB(
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
  async deleteBybitCurrencyFromUserListDB(
    @Param('symbol') symbol: string,
    @Req() req: any,
  ) {
    const result = await this.bybitService.deleteBybitCurrencyFromUserListDB(
      symbol,
      req.user,
    );
    return result;
  }

  @ApiCreatedResponse({
    description: 'Changed currencies order',
    type: BybitCurrencyEntity,
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
  async changeByBitCurrenciesOrder(@Body() dto: CurrencyChangeOrderDto) {
    const result = await this.bybitService.changeByBitCurrenciesOrder(dto);
    return result;
  }
}
