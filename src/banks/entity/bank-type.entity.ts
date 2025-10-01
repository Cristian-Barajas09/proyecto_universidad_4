import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class BankType extends Document {
  @Prop()
  public name: string;
}

export const BankTypeSchema = SchemaFactory.createForClass(BankType);
