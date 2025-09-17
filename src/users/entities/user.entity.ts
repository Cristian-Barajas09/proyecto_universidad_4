import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  public full_name: string;
  public email: string;
  public password: string;
  public identity_document: string;
  public photo: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
