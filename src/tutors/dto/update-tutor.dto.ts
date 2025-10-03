import { PartialType } from '@nestjs/mapped-types';
import { RegisterTutorDto } from './register-tutor.dto';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateTutorDTO extends PartialType(RegisterTutorDto) {
  @IsOptional()
  @IsUrl()
  public photo?: string;
}
