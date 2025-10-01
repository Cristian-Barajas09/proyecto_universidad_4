import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  public participants: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  public messages: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
