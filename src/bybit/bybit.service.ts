import { CurrencyChangeOrderDto } from './../dtos/currency.change.order.dto';
import { BybitCurrencyEntity } from './../db/entities/bybit.currency.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './../db/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';

@WebSocketGateway({
  namespace: 'bybit',
})
@Injectable()
export class BybitService implements OnGatewayInit {
  private readonly logger = new Logger(BybitService.name);
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(BybitCurrencyEntity)
    private bybitCurrencyRepo: Repository<BybitCurrencyEntity>,
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

  async getBybitCurrencies(options) {
    const paginateOptions = await this.getOptions(options);

    const { per_page, offset, search, sort } = paginateOptions;

    const [items, count] = await this.bybitCurrencyRepo.findAndCount({
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

  async getBybitOneCurrency(symbol: string) {
    const oneCurrency = await this.bybitCurrencyRepo.findOne({
      where: {
        symbol: symbol,
      },
    });

    if (!oneCurrency) {
      throw new HttpException('This currency not found', 400);
    }

    return oneCurrency;
  }

  async addBybitCurrencyListToDB() {
    try {
      const { data } = await this.httpService.axiosRef.get(
        `${process.env.BASE_URL_BYBIT_API}spot/v3/public/symbols`,
      );
      const resArr = [];

      data.result.list.forEach((el, i) =>
        resArr.push(
          Object.assign({}, { ['symbol']: el.name, ['orderDigit']: +i + 1 }),
        ),
      );

      const bybitCurrencyRepo = this.bybitCurrencyRepo;

      const bybitCurrencyList = await this.bybitCurrencyRepo.create(resArr);
      const bybitCreatedCurrencyList = await bybitCurrencyRepo.save(
        bybitCurrencyList,
      );

      return bybitCreatedCurrencyList;
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException('This currency list already exists', 400);
      }
    }
  }

  async addBybitOneCurrencyToDB({ symbol }) {
    try {
      const currency = new BybitCurrencyEntity();

      currency.symbol = symbol;
      const addCurrency = await this.bybitCurrencyRepo.create(currency);

      const saveCurrency = await this.bybitCurrencyRepo.save(addCurrency);

      return saveCurrency;
    } catch (error) {
      if (error.code === '23505') {
        throw new HttpException('This currency already exists', 400);
      }
    }
  }

  async deleteBybitOneCurrencyInDB({ symbol }) {
    const currency: object = await this.bybitCurrencyRepo.findOne({
      where: {
        symbol: symbol,
      },
    });

    if (!currency) {
      throw new HttpException('This currency not found', 400);
    }

    const result = currency;
    await this.bybitCurrencyRepo.delete(currency);

    return result;
  }

  async updateBybitCurrencyListDB() {
    const { data } = await this.httpService.axiosRef.get(
      `${process.env.BASE_URL_BYBIT_API}spot/v3/public/symbols`,
    );
    const resDataFromBybit = data.result;
    const resDataFromDatabase = await this.bybitCurrencyRepo.find();

    const findMyDiffElems = (bybit, dataBase) => {
      const deleted = [],
        added = [];

      // delete
      dataBase.forEach((itemDB) => {
        if (!bybit[itemDB.symbol]) {
          deleted.push(itemDB.symbol);
        }
      });

      // add
      const bybitToArr = Object.keys(bybit);
      for (let i = 0; i < bybitToArr.length; i++) {
        if (!dataBase.some((el) => el.symbol === bybitToArr[i])) {
          added.push(bybitToArr[i]);
        }
      }

      return { deleted, added };
    };

    const changedDataFromBybit = resDataFromBybit.list.reduce(
      (state, el) => ({
        [el.name]: true,
        ...state,
      }),
      {},
    );

    const { deleted, added } = findMyDiffElems(
      changedDataFromBybit,
      resDataFromDatabase,
    );

    await deleted.forEach((el) => {
      const deleteOne = resDataFromDatabase.find((e) => e.symbol === el);
      this.bybitCurrencyRepo.remove(deleteOne);
      return;
    });

    let startPoint =
      resDataFromDatabase[resDataFromDatabase.length - 1].orderDigit;

    await added.forEach((el) => {
      const currency = new BybitCurrencyEntity();
      currency.symbol = el;
      startPoint++;
      currency.orderDigit = startPoint;
      this.bybitCurrencyRepo.save(currency);
      return;
    });

    return { deleted, added };
  }

  async addBybitCurrencyToUserListDB(symbol: string, userId: number) {
    try {
      const user = await this.userRepo.findOne({
        where: {
          id: userId,
        },
        relations: ['bybitCurrencies'],
      });

      const currency = await this.bybitCurrencyRepo.findOne({
        where: {
          symbol: symbol,
        },
      });

      if (!currency) {
        throw new HttpException('Currency not exists in DB', 400);
      }

      const currencyExistsInListAud = user.bybitCurrencies.some(
        (el) => el.symbol === symbol,
      );

      if (currencyExistsInListAud) {
        throw new HttpException('This relation already exists', 400);
      }

      currency.symbol = symbol;
      await this.bybitCurrencyRepo.save(currency);

      user.bybitCurrencies = [...user.bybitCurrencies, currency];
      await this.userRepo.save(user);

      return user.bybitCurrencies;
    } catch (error) {
      throw new HttpException('Bad request', 400);
    }
  }

  async deleteBybitCurrencyFromUserListDB(symbol: string, userId: number) {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: ['bybitCurrencies'],
    });

    let result: object;

    const deleteCurrency = user.bybitCurrencies.filter((el) => {
      const findForDeleting = el.symbol !== symbol;
      if (!findForDeleting) {
        result = el;
      }
      return findForDeleting;
    });
    user.bybitCurrencies = [...deleteCurrency];
    await this.userRepo.save(user);

    return result;
  }

  async changeByBitCurrenciesOrder(dto: CurrencyChangeOrderDto) {
    const currency = await this.bybitCurrencyRepo.findOne({
      where: {
        symbol: dto.symbol,
      },
    });

    const data = await this.bybitCurrencyRepo.find({
      order: {
        orderDigit: 'ASC',
      },
    });

    if (!currency) {
      throw new HttpException('Currency not found', 400);
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

    await this.bybitCurrencyRepo.save(cuttedArray);
    await this.bybitCurrencyRepo.save(currency);
    return currency;
  }
}
