import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { SoftEntity } from 'src/common/interfaces/soft-entity.interface';

@Schema()
export class Tutor extends Document implements SoftEntity {
  @Prop({ type: Types.Decimal128 })
  public price_per_hour: number;

  @Prop()
  public biografy: string;

  @Prop()
  public verified: boolean;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'User' })
  public user: Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Specialty' }] })
  public specialties: Types.ObjectId[];

  @Prop()
  public deletedAt?: Date;

  @Prop()
  public updatedAt?: Date;

  @Prop()
  public createdAt?: Date;
}

export const TutorSchema = SchemaFactory.createForClass(Tutor);

TutorSchema.set('timestamps', true);
