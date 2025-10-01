import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Chat' })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop()
  text: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
export const MessageSchema = SchemaFactory.createForClass(Message);
