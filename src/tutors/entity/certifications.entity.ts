import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Certification extends Document {
  @Prop()
  public title: string;

  @Prop()
  public fileUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' })
  public tutor: Types.ObjectId;
}

export const CertificationSchema = SchemaFactory.createForClass(Certification);
