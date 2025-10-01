import { PartialType } from '@nestjs/mapped-types';
import { RegisterTutorDto } from './register-tutor.dto';

export class UpdateTutorDTO extends PartialType(RegisterTutorDto) {}
