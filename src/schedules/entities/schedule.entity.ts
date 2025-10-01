import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ScheduleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  PROGRESS = 'progress',
  CANCELED = 'canceled',
}

@Schema()
export class Schedule extends Document {
  @Prop()
  public date: Date;

  @Prop({ type: Types.Double })
  public duration: number;

  @Prop()
  public hour: number;

  @Prop()
  public status: ScheduleStatus;

  @Prop({ type: Types.Decimal128 })
  public totalPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  public student: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tutor' })
  public tutor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Call' })
  public call: Types.ObjectId;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);
