import { ApiProperty } from '@nestjs/swagger';

export class ErrorSwaggerResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: [];
}
