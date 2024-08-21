import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { NextFunction, Request, Response } from 'express'

interface ReqCount {
  count: number
  time: number
}

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ttl = 60_000
    const limit = 10

    const data: ReqCount = await this.cache.get(req.ip)
    if (!data) {
      await this.cache.set(req.ip, { count: 1, time: Date.now() }, ttl)
      next()
      return
    }

    const { count, time } = data

    if (count >= limit) {
      res.status(429).json({
        message: ['you have exceeded the request limit, try later'],
        error: 'Too many requests',
        statusCode: 429
      })
      return
    }

    const newTtl = ttl - (Date.now() - time)
    if (newTtl <= 0) {
      next()
      return
    }

    await this.cache.set(req.ip, { ...data, count: count + 1 }, newTtl)

    next()
  }
}
