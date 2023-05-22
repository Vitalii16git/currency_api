import { ErrorSwaggerResponse } from './../responses/error.swagger.response';

import { UsersService } from './../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthLoginDto } from './../dtos/auth-login.dto';
import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @ApiOkResponse()
  @ApiBadRequestResponse({
    description: 'Bad authentication data',
    type: ErrorSwaggerResponse,
  })
  @Post()
  async login(@Body() authLoginDto: AuthLoginDto) {
    return this.authService.login(authLoginDto);
  }

  @ApiUnauthorizedResponse({
    description: 'User not authorized',
    type: ErrorSwaggerResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('assess-token')
  async getProfile(@Req() req: any) {
    const userId = await req.user.userId;

    return this.userService.showById(userId);
  }
}
