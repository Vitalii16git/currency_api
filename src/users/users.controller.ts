import { UserPaginateSwaggerResponse } from './../responses/user.paginate.swagger.response';
import { ErrorSwaggerResponse } from './../responses/error.swagger.response';

import { UserEntity } from '../db/entities/user.entity';
import { CreateUserDto } from '../dtos/create.user.dto';
import { Body, Controller, Post, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ description: 'Created user', type: UserEntity })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({
    description: 'Users which you searched',
    type: UserPaginateSwaggerResponse,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @ApiQuery({
    name: 'per_page',
    required: false,
    description: 'How many users take from DB (if empty 10 by default)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description:
      'Start position for the users which we will take them from DB  (if empty 0 by default)',
  })
  @ApiQuery({
    name: 'with_options',
    required: false,
    description: 'Return users with option relations',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search users by email',
  })
  @Get()
  async getUsers(@Query() options: { per_page; offset; with_options; search }) {
    const result = await this.usersService.getUsers(options);
    return result;
  }

  @ApiOkResponse({ description: 'User which you searched', type: UserEntity })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @Get(':userId')
  show(@Param('userId') userId: number) {
    return this.usersService.showById(userId);
  }
}
