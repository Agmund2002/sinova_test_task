import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common'
import { UrlService } from './url.service'
import { UrlDto } from './dtos'
import { ValidateCodePipe } from './pipes'
import { Response } from 'express'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('URL Shortening')
@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @ApiOperation({ summary: 'Shorten URL' })
  @ApiBody({
    type: UrlDto,
    examples: {
      dummy: {
        value: {
          url: 'https://github.com/Agmund2002'
        } as UrlDto
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'The URL has been successfully shortened',
    content: {
      'application/json': {
        example: {
          shortUrl: 'http://localhost:3000/phs3bg'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Post('/shorten')
  create(@Body() dto: UrlDto) {
    return this.urlService.createShortUrl(dto)
  }

  @ApiOperation({ summary: 'Redirect to the original address' })
  @ApiResponse({
    status: 302,
    description: 'Thr redirection was successful'
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('/:code')
  redirect(
    @Res({ passthrough: true }) res: Response,
    @Param('code', new ValidateCodePipe())
    code: string
  ) {
    return this.urlService.redirect(res, code)
  }

  @ApiOperation({ summary: 'Get statistics about the shortened URL' })
  @ApiResponse({
    status: 200,
    description: 'Statistics got successfully',
    content: {
      'application/json': {
        example: {
          _id: '66c5a46cc1b84793e9eadede',
          url: 'https://github.com/Agmund2002',
          code: 'phs3bg',
          clicks: 4,
          createdAt: '2024-08-21T08:25:16.406Z',
          updatedAt: '2024-08-21T08:55:12.611Z'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Get('/stats/:code')
  statistics(
    @Param('code', new ValidateCodePipe())
    code: string
  ) {
    return this.urlService.statistics(code)
  }
}
