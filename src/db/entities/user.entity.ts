import { BybitCurrencyEntity } from './bybit.currency.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Length, Max } from 'class-validator';
import { BinanceCurrencyEntity } from './binance.currency.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Length(8, 24)
  @Exclude()
  @Column()
  password: string;

  @Max(10)
  @ManyToMany(
    () => BinanceCurrencyEntity,
    (binanceCurrencyEntity) => binanceCurrencyEntity.users,
    {
      cascade: true,
    },
  )
  binanceCurrencies: BinanceCurrencyEntity[];

  @Max(10)
  @ManyToMany(
    () => BybitCurrencyEntity,
    (bybitCurrencyEntity) => bybitCurrencyEntity.users,
    {
      cascade: true,
    },
  )
  bybitCurrencies: BybitCurrencyEntity[];

  @ApiProperty()
  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 8);
  }

  async validatePassword(password: string): Promise<boolean> {
    const compare = await bcrypt.compare(password, this.password);
    return compare;
  }
}
