import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsOptional,
  IsMongoId,
  IsString,
} from 'class-validator';

export class FilterDTO {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public page?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public limit?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  public specialties?: string[];

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public rating?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  public price?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  public recent?: boolean;

  @IsOptional()
  @IsString()
  public name?: string;
}
