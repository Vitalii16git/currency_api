import { UserEntity } from './user.entity';

import {
  Entity,
  JoinTable,
  ManyToMany,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class BybitCurrencyEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  symbol: string;

  @ApiProperty()
  @Column()
  orderDigit: number;

  @ManyToMany(() => UserEntity, (userEntity) => userEntity.bybitCurrencies)
  @JoinTable()
  users: UserEntity[];
}
