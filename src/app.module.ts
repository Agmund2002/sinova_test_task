import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { UrlModule } from './url/url.module'
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-redis-yet'
import { RateLimitingMiddleware } from './middlewares'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          store: await redisStore({
            socket: {
              host: config.get<string>('REDIS_HOST'),
              port: +config.get<number>('REDIS_PORT'),
              ...(config.get('REDIS_PASSWORD') && {
                password: config.get('REDIS_PASSWORD')
              })
            }
          }),
          ttl: 0,
          max: 1000,
          evictionStrategy: 'LRU'
        } as CacheModuleAsyncOptions
      }
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DATABASE_URL')
      })
    }),
    UrlModule
  ],
  controllers: [AppController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitingMiddleware).forRoutes('*')
  }
}
