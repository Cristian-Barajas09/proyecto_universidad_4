import { PartialType } from '@nestjs/mapped-types';
import { RegisterTutorDto } from './register-tutor.dto';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { TemaryDTO } from './temary.dto';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemaryDTO)
  public temary: TemaryDTO[];
}
