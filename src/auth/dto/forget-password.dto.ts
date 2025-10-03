import { IsEmail } from 'class-validator';

export class ForgetPassword {
  @IsEmail(undefined, { message: 'El email debe tener un formato válido' })
  email: string;
}
