import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDTO {
  @IsEmail(undefined, { message: 'El email debe tener un formato válido' })
  email: string;
  code: string;
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(16, {
    message: 'La contraseña no debe tener más de 16 caracteres',
  })
  @Matches(/(?:^(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número o un carácter especial',
  })
  newPassword: string;
}
