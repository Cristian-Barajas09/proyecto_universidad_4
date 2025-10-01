import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema()
export class Call extends Document {
  @Prop()
  public tutorLink: string;

  @Prop()
  public studentLink: string;

  @Prop({ type: Types.ObjectId, ref: 'Schedule' })
  public schedule: Types.ObjectId;

  @Prop()
  public isSended: boolean;
}

export const CallSchema = SchemaFactory.createForClass(Call);
