import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Schema()
export class User extends Document {
  @Prop()
  public fullName: string;

  @Prop()
  public email: string;

  @Prop({ select: false })
  public password: string;

  @Prop()
  public identityDocument: string;

  @Prop()
  public resetCode?: string;

  @Prop()
  public photo: string;

  @Prop({ type: String, enum: ValidRoles, default: ValidRoles.STUDENT })
  public rol: ValidRoles;
}

export const UserSchema = SchemaFactory.createForClass(User);
