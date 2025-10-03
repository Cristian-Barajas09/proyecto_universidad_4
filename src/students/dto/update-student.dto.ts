import { PartialType } from '@nestjs/mapped-types';
import { RegisterStudentDto } from './register-student.dto';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateStudentDto extends PartialType(RegisterStudentDto) {
  @IsOptional()
  @IsUrl()
  public photo?: string;
}
