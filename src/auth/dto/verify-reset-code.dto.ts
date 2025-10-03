import { IsEmail, IsString } from 'class-validator';

export class VerifyResetCode {
  @IsEmail(undefined, { message: 'El email debe tener un formato válido' })
  email: string;
  @IsString({ message: 'El código debe ser una cadena de texto' })
  code: string;
}
