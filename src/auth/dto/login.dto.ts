import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsEmail()
  public email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número o un carácter especial',
  })
  public password: string;
}
