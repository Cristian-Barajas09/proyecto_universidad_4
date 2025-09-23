import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterStudentDto {
  @IsString()
  @MinLength(3)
  fullName: string;

  @IsString()
  @MinLength(3)
  @IsEmail() // todo: use regular expression
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(3)
  identityDocument: string;

  @IsString()
  @MinLength(3)
  university: string;
}
