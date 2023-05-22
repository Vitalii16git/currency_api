import { CurrencyChangeOrderDto } from './../dtos/currency.change.order.dto';
import { BinanceCurrencyEntity } from './../db/entities/binance.currency.entity';
import { UserEntity } from './../db/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';

@WebSocketGateway({
  namespace: 'binance',
})
@Injectable()
export class BinanceService implements OnGatewayInit {
  private readonly logger = new Logger(BinanceService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(BinanceCurrencyEntity)
    private binanceCurrencyRepo: Repository<BinanceCurrencyEntity>,
  ) {}

  afterInit(): void {
    this.logger.log('Websocket Gateway initialized.');
  }

  async getOptions(paginate) {
    const { per_page, offset, search } = paginate;
    let { sort } = paginate;

    if (sort) sort = sort.toUpperCase();

    if (sort && !(sort === 'ASC' || sort === 'DESC')) {
      throw new HttpException('Incorrect sort order', 400);
    }

    if (per_page) {
      paginate.per_page = +per_page;
    } else {
      paginate.per_page = 10;
    }

    if (offset) {
      paginate.offset = +offset;
    } else {
      paginate.offset = 0;
    }

    if (search) paginate.search = Like(`%${search}%`);

    if (sort === 'ASC' || !sort) paginate.sort = 'ASC';
    if (sort === 'DESC') paginate.sort = 'DESC';

    return paginate;
  }

  async getBinanceCurrencies(options) {
    const paginateOptions = await this.getOptions(options);

    const { per_page, offset, search, sort } = paginateOptions;

    const [items, count] = await this.binanceCurrencyRepo.findAndCount({
      where: {
        symbol: search,
      },
      skip: offset,
      take: per_page,
      order: {
        orderDigit: sort,
      },
    });

    return {
      pagination: {
        per_page,
        offset,
        total: count,
      },
      data: items,
    };
  }

  async getBinanceOneCurrency(symbol: string) {
    const oneCurrency = await this.binanceCurrencyRepo.findOne({
      where: {
        symbol: symbol,
      },
    });

    if (!oneCurrency) {
      throw new HttpException('This currency not found', 400);
    }

    return oneCurrency;
  }

  async addBinanceCurrencyListToDB() {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${process.env.BASE_URL_BINANCE_API}api/v3/exchangeInfo`,
      );
      const resArr = [];

      data.symbols.forEach((el, i) =>
        resArr.push(
          Object.assign({}, { ['symbol']: el.symbol, ['orderDigit']: +i + 1 }),
        ),
      );

      const binanceCurrencyRepo = this.binanceCurrencyRepo;

      const currencyList = await binanceCurrencyRepo.create(resArr);
      const createdCurrencyList = await binanceCurrencyRepo.save(currencyList);

      return createdCurrencyList;
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException('This currency list already exists', 400);
      }
    }
  }

  async addBinanceOneCurrencyToDB({ symbol }) {
    try {
      const currency = new BinanceCurrencyEntity();

      currency.symbol = symbol;
      const addCurrency = await this.binanceCurrencyRepo.create(currency);

      const saveCurrency = await this.binanceCurrencyRepo.save(addCurrency);

      return saveCurrency;
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException('This currency already exists', 400);
      }
    }
  }

  async deleteBinanceOneCurrencyInDB({ symbol }) {
    const currency: object = await this.binanceCurrencyRepo.findOne({
      where: {
        symbol: symbol,
      },
    });

    if (!currency) {
      throw new HttpException('This currency not found', 400);
    }

    const result = currency;
    await this.binanceCurrencyRepo.delete(currency);

    return result;
  }

  async updateBinanceCurrencyListDB() {
    const { data } = await this.httpService.axiosRef.get(
      `${process.env.BASE_URL_BINANCE_API}api/v3/exchangeInfo`,
    );
    const resDataFromBinance = data;
    const resDataFromDatabase = await this.binanceCurrencyRepo.find({
      order: {
        orderDigit: 'ASC',
      },
    });

    const findMyDiffElems = (binance, dataBase) => {
      const deleted = [],
        added = [];

      // delete
      dataBase.forEach((itemDB) => {
        if (!binance[itemDB.symbol]) {
          deleted.push(itemDB.symbol);
        }
      });

      // add
      const binanceToArr = Object.keys(binance);
      for (let i = 0; i < binanceToArr.length; i++) {
        if (!dataBase.some((el) => el.symbol === binanceToArr[i])) {
          added.push(binanceToArr[i]);
        }
      }

      return { deleted, added };
    };

    const changedDataFromBinance = resDataFromBinance.symbols.reduce(
      (state, el) => ({
        [el.symbol]: true,
        ...state,
      }),
      {},
    );

    const { deleted, added } = findMyDiffElems(
      changedDataFromBinance,
      resDataFromDatabase,
    );

    await deleted.forEach((el) => {
      const deleteOne = resDataFromDatabase.find((e) => e.symbol === el);
      this.binanceCurrencyRepo.remove(deleteOne);
      return;
    });

    let startPoint =
      resDataFromDatabase[resDataFromDatabase.length - 1].orderDigit;

    await added.forEach((el) => {
      const currency = new BinanceCurrencyEntity();
      currency.symbol = el;
      startPoint++;
      currency.orderDigit = startPoint;
      this.binanceCurrencyRepo.save(currency);
      return;
    });

    return { deleted, added };
  }

  async addBinanceCurrencyToUserListDB(symbol, userId) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['binanceCurrencies'],
    });

    const currency = await this.binanceCurrencyRepo.findOne({
      where: {
        symbol: symbol,
      },
    });

    if (!currency) {
      throw new HttpException('Currency not exists in DB', 400);
    }

    const currencyExistsInListAud = user.binanceCurrencies.some(
      (el) => el.symbol === symbol,
    );

    if (currencyExistsInListAud) {
      throw new HttpException('This relation already exists', 400);
    }

    currency.symbol = symbol;
    await this.binanceCurrencyRepo.save(currency);

    user.binanceCurrencies = [...user.binanceCurrencies, currency];
    await this.userRepo.save(user);

    return user.binanceCurrencies;
  }

  async deleteBinanceCurrencyFromUserListDB(symbol: string, userId: number) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['binanceCurrencies'],
    });

    let result: object;

    const deleteCurrency = user.binanceCurrencies.filter((el) => {
      const findForDeleting = el.symbol !== symbol;
      if (!findForDeleting) {
        result = el;
      }
      return findForDeleting;
    });
    user.binanceCurrencies = [...deleteCurrency];
    await this.userRepo.save(user);

    return result;
  }

  async changeBinanceCurrenciesOrder(dto: CurrencyChangeOrderDto) {
    const currency = await this.binanceCurrencyRepo.findOne({
      where: {
        symbol: dto.symbol,
      },
    });

    const data = await this.binanceCurrencyRepo.find({
      order: {
        orderDigit: 'ASC',
      },
    });

    if (!currency) {
      throw new HttpException('Currency not found', 400);
    }

    if (!data) {
      throw new HttpException('Database is empty', 400);
    }
    currency.orderDigit = dto.orderDigit;

    const cuttedArray = data.slice(currency.orderDigit - 2);

    cuttedArray.reduce((acc, curr): any => {
      const firstElem =
        acc.orderDigit === currency.orderDigit && acc.id !== currency.id;
      if (firstElem) {
        acc.orderDigit++;
      }

      const previousPlace = acc.id === currency.id;

      if (previousPlace) {
        curr.orderDigit = acc.orderDigit;
        return curr;
      }

      const notFirstElems = acc.orderDigit !== currency.orderDigit;

      if (notFirstElems) {
        curr.orderDigit = acc.orderDigit + 1;
      }
      console.log('acc :', acc.orderDigit, 'curr :', curr.orderDigit);

      return curr;
    });

    await this.binanceCurrencyRepo.save(data);
    await this.binanceCurrencyRepo.save(currency);
    return currency;
  }
}
