import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ParseModule } from './parse/parse.module';
import { BinanceModule } from './binance/binance.module';
import { BybitModule } from './bybit/bybit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '**', '*.migration.{ts,js}')],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    ParseModule,
    BinanceModule,
    BybitModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronService],
})
export class AppModule {}
