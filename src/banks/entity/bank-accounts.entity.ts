import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class BankAccount extends Document {
  @Prop()
  public accountNumber: string;

  @Prop()
  public email: string;

  @Prop()
  public bankName: string;

  @Prop()
  public rutTitular: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  public user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BankType' })
  public bankType: Types.ObjectId;
}

export const BankSchema = SchemaFactory.createForClass(BankAccount);
