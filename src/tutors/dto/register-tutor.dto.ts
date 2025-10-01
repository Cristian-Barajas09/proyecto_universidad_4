import { IsArray, IsMongoId, ValidateNested } from 'class-validator';
import { CertificationDto } from './certifications.dto';
import { AbstractRegisterDTO } from 'src/auth/dto/abstract-register.dto';
import { CreateBankDto } from 'src/banks/dto/create-bank.dto';
import { Type } from 'class-transformer';

export class RegisterTutorDto extends AbstractRegisterDTO {
  @IsArray()
  public certifications: CertificationDto[];

  @IsArray()
  @IsMongoId({ each: true })
  public specialties: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankDto)
  public bankAccounts: CreateBankDto[];
}
