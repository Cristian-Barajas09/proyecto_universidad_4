import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Student } from 'src/students/entities/student.entity';

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
  public photo: string;

  @Prop({ type: String, enum: ValidRoles, default: [ValidRoles.STUDENT] })
  public rol: ValidRoles;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student' })
  student: Student;
}

export const UserSchema = SchemaFactory.createForClass(User);
