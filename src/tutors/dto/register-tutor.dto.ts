import { IsArray, IsMongoId } from 'class-validator';
import { CertificationDto } from './certifications.dto';
import { AbstractRegisterDTO } from 'src/auth/dto/abstract-register.dto';

export class RegisterTutorDto extends AbstractRegisterDTO {
  @IsArray()
  public certifications: CertificationDto[];

  @IsArray()
  @IsMongoId({ each: true })
  public specialties: string[];
}
