import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Url } from './schemas'
import { Model } from 'mongoose'
import { UrlDto } from './dtos'
import { generateRandomCode } from './helpers'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Response } from 'express'

@Injectable()
export class UrlService {
  private readonly logger = new Logger()

  constructor(
    @InjectModel(Url.name) private readonly urlModel: Model<Url>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly config: ConfigService
  ) {}

  async createShortUrl(dto: UrlDto): Promise<{ shortUrl: string }> {
    try {
      const isUrlExist = await this.isUrlExist(dto.url)
      if (!isUrlExist)
        throw new NotFoundException('nothing was found at this URL')

      const shortUrl = await this.urlModel.findOne({ url: dto.url })
      if (shortUrl)
        throw new ConflictException('short address for this URL already exists')

      const code = await this.generateCodeForUrl(dto)

      return { shortUrl: `${this.config.get('BASE_URL')}/${code}` }
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      if (error instanceof ConflictException) throw error

      this.logger.error('error during creating the short URL: ', error)

      throw new InternalServerErrorException(
        'error during creating the short URL'
      )
    }
  }

  async redirect(res: Response, code: string): Promise<void> {
    try {
      const url: string =
        (await this.cache.get(code)) ??
        (await this.urlModel.findOne({ code })).url

      if (!url) throw new NotFoundException('url not found')

      res.status(302).redirect(url)
    } catch (error) {
      if (error instanceof NotFoundException) throw error

      this.logger.error('error during redirection: ', error)

      throw new InternalServerErrorException('error during redirection')
    }
  }

  private async generateCodeForUrl(dto: UrlDto): Promise<string> {
    try {
      const code = generateRandomCode(6)

      await this.urlModel.create({ ...dto, code })

      await this.cache.set(code, dto.url)

      return code
    } catch (error) {
      if (error.code === 11000) {
        await this.generateCodeForUrl(dto)
      }
    }
  }

  private async isUrlExist(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' })

      return res.ok
    } catch (error) {
      return false
    }
  }
}
