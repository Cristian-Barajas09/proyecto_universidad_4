import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Temary {
  @Prop({ required: true })
  public title: string;

  @Prop({ required: true })
  public description: string;

  @Prop({ type: Types.ObjectId, ref: 'Tutor' })
  public tutor: Types.ObjectId;
}

export const TemarySchema = SchemaFactory.createForClass(Temary);
