import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Certification extends Document {
  @Prop()
  public title: string;

  @Prop()
  public fileUrl: string;

  @Prop()
  public institute: string;

  @Prop()
  public date: Date;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Tutor' })
  public tutor: Types.ObjectId;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);
