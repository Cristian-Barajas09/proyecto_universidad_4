import { PartialType } from '@nestjs/mapped-types';
import { RegisterTutorDto } from './register-tutor.dto';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateTutorDTO extends PartialType(RegisterTutorDto) {
  @IsOptional()
  @IsUrl()
  public photo?: string;

  @IsOptional()
  @IsString()
  public biografy: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  public pricePerHour: number;
}
