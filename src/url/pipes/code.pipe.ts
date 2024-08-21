import {
  ArgumentMetadata,
  Injectable,
  NotAcceptableException,
  PipeTransform
} from '@nestjs/common'

@Injectable()
export class ValidateCodePipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const regExp = /^[a-z0-9]+$/

    if (metadata.type !== 'param' || value.length !== 6 || !value.match(regExp))
      throw new NotAcceptableException('invalid short URL')

    return value
  }
}
