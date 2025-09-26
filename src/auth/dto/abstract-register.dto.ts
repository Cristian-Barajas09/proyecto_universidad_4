import { Matches, IsString, MinLength, IsEmail } from 'class-validator';

export class AbstractRegisterDTO {
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MinLength(4, {
    message: 'El nombre completo debe tener al menos 4 caracteres',
  })
  public fullName: string;

  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsEmail(undefined, { message: 'El email debe tener un formato válido' })
  public email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número o un carácter especial',
  })
  public password: string;
}
