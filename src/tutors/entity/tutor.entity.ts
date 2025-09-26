import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema()
export class Tutor extends Document {
  @Prop({ type: Types.Decimal128 })
  public price_per_hour: number;

  @Prop()
  public biografy: string;

  @Prop()
  public verified: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  public user: Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' }] })
  public specialties: Types.ObjectId[];
}

export const TutorSchema = SchemaFactory.createForClass(Tutor);
