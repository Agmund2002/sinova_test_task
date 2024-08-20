import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsUrl } from 'class-validator'

export class UrlDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsUrl()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.replace(/\/$/, '')
    }
    return value
  })
  url: string
}
