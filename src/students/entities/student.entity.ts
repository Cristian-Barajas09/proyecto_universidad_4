import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Student extends Document {
  public university: string;

  public user: Types.ObjectId;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
