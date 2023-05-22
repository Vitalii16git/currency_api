import { ErrorSwaggerResponse } from './../responses/error.swagger.response';
import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ParseService } from './parse.service';

@ApiTags('Parse')
@Controller('/parse')
export class ParseController {
  constructor(private readonly parseService: ParseService) {}

  @ApiOkResponse({
    description: 'Parse data from web page',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    type: ErrorSwaggerResponse,
  })
  @Get()
  async parseWebPage() {
    const result = await this.parseService.parseWebPage();
    return result;
  }
}
