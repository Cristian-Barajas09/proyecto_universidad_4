import { IsString, MinLength } from 'class-validator';
import { AbstractRegisterDTO } from 'src/auth/dto/abstract-register.dto';

export class RegisterStudentDto extends AbstractRegisterDTO {
  @IsString({
    message: 'El documento de identidad debe ser una cadena de texto',
  })
  @MinLength(3, {
    message: 'El documento de identidad debe tener al menos 3 caracteres',
  })
  identityDocument: string;

  @IsString({ message: 'La universidad debe ser una cadena de texto' })
  @MinLength(3, {
    message: 'La universidad debe tener al menos 3 caracteres',
  })
  university: string;
}
