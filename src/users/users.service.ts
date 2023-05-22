import { UserEntity } from '../db/entities/user.entity';
import { CreateUserDto } from '../dtos/create.user.dto';
import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);

    if (!user) {
      throw new HttpException('Incorrect data in body', 400);
    }

    const checkDupes = await this.userRepository.findOne({
      where: {
        email: user.email,
      },
    });
    if (checkDupes) {
      throw new HttpException('User with this email already exists', 400);
    }

    return this.userRepository.save(user);
  }

  async getOptions(paginate) {
    const { per_page, offset, with_options, search } = paginate;

    if (
      !!this.userRepository.find({
        relations: [with_options],
      })
    ) {
      throw new HttpException(
        `${with_options} was not found in relations`,
        400,
      );
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

    if (with_options === 'currencies') {
      paginate.with_options = ['binanceCurrencies', 'bybitCurrencies'];
    }

    if (with_options !== 'currencies' && with_options) {
      paginate.with_options = [with_options];
    }

    return paginate;
  }

  async getUsers(options) {
    const paginateOptions = await this.getOptions(options);

    const { per_page, offset, with_options, search } = paginateOptions;

    const [items, count] = await this.userRepository.findAndCount({
      where: {
        email: search,
      },
      relations: with_options,
      skip: offset,
      take: per_page,
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

  async showById(userId: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 400);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    return user;
  }
}
