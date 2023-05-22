import { REGEX, MESSAGES } from '../utilts/app.utils';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 24)
  @Matches(REGEX.PASSWORD_RULE, {
    message: MESSAGES.PASSWORD_RULE_MESSAGE,
  })
  password: string;
}
