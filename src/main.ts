import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, { abortOnError: false })

    app.enableCors()

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true
      })
    )

    const config = new DocumentBuilder()
      .setTitle('SINOVA_TEST_TASK')
      .setVersion('0.0.1')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)

    const env = app.get(ConfigService)

    await app.listen(env.get('PORT'), () =>
      console.log(`Server running. Use our API on port: ${env.get('PORT')}`)
    )
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}
bootstrap()
