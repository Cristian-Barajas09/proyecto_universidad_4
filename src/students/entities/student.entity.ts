import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Student extends Document {
  @Prop()
  public university: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  public user: Types.ObjectId;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
