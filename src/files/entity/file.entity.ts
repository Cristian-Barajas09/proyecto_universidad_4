import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class File extends Document {
  @Prop()
  filename: string;

  @Prop()
  mimetype: string;

  @Prop()
  size: number;

  @Prop()
  url: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
