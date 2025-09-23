import { IsString, MaxLength, MinLength, IsArray } from 'class-validator';
import { CertificationDto } from './certifications.dto';

export class RegisterTutorDto {
  @IsString()
  @MaxLength(4)
  public fullName: string;

  @IsString()
  public email: string;

  @IsString()
  @MinLength(8)
  public password: string;

  @IsArray()
  public certifications: CertificationDto[];
}
