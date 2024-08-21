import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common'
import { UrlService } from './url.service'
import { UrlDto } from './dtos'
import { ValidateCodePipe } from './pipes'
import { Response } from 'express'

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/shorten')
  create(@Body() dto: UrlDto) {
    return this.urlService.createShortUrl(dto)
  }

  @Get('/:code')
  redirect(
    @Res({ passthrough: true }) res: Response,
    @Param('code', new ValidateCodePipe())
    code: string
  ) {
    return this.urlService.redirect(res, code)
  }
}
