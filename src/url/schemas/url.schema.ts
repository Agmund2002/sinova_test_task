import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UrlDocument = HydratedDocument<Url>

@Schema({ timestamps: true, versionKey: false, collection: 'urls' })
export class Url {
  @Prop({ required: true, unique: true })
  url: string

  @Prop({ required: true, length: 6, unique: true })
  code: string

  @Prop({ default: 0 })
  clicks: number
}

export const UrlSchema = SchemaFactory.createForClass(Url)
