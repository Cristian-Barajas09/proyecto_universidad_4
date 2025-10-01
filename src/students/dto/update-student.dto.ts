import { PartialType } from '@nestjs/mapped-types';
import { RegisterStudentDto } from './register-student.dto';

export class UpdateStudentDto extends PartialType(RegisterStudentDto) {}
