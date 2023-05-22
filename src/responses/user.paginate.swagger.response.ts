import { UserEntity } from './../db/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

class Pagination {
  @ApiProperty()
  per_page: number;
  @ApiProperty()
  offset: number;
  @ApiProperty()
  with: string;
  @ApiProperty()
  total: number;
}

class User {
  data: UserEntity;
}

export class UserPaginateSwaggerResponse {
  @ApiProperty()
  pagination: Pagination;
  @ApiProperty()
  data: User[];
}
