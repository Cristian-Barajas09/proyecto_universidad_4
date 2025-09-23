import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDTO {
  @IsString()
  @IsEmail()
  public email: string;

  @IsString()
  @MinLength(6)
  public password: string;
}
