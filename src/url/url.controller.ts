import { Body, Controller, Post } from '@nestjs/common'
import { UrlService } from './url.service'
import { UrlDto } from './dtos'

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('/shorten')
  create(@Body() dto: UrlDto) {
    return this.urlService.createShortUrl(dto)
  }
}
