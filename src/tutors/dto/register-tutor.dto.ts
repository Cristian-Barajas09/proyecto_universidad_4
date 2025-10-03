import {
  IsArray,
  IsMongoId,
  ValidateNested,
  IsString,
  IsOptional,
} from 'class-validator';
import { CertificationDto } from './certifications.dto';
import { AbstractRegisterDTO } from 'src/auth/dto/abstract-register.dto';
import { CreateBankDto } from 'src/banks/dto/create-bank.dto';
import { Type } from 'class-transformer';

export class RegisterTutorDto extends AbstractRegisterDTO {
  @IsString()
  public identityDocument: string;

  @IsString()
  public phoneNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationDto)
  public certifications: CertificationDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public specialties: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankDto)
  public bankAccounts: CreateBankDto[];
}
