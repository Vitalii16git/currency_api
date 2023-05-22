import { UserEntity } from '../db/entities/user.entity';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [TypeOrmModule.forFeature([UserEntity])],
})
export class UsersModule {}
