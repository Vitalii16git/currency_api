import { UserEntity } from '../db/entities/user.entity';
import { AuthLoginDto } from './../dtos/auth-login.dto';
import { UsersService } from './../users/users.service';
import { Injectable, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.validateUser(authLoginDto);

    const payload = {
      userId: user.id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(authLoginDto: AuthLoginDto): Promise<UserEntity> {
    const { email, password } = authLoginDto;

    const user = await this.usersService.findByEmail(email);
    if (!(await user?.validatePassword(password))) {
      throw new HttpException('Incorrect data for authentication', 401);
    }

    return user;
  }
}
