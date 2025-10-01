import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import { TutorsService } from 'src/tutors/services/tutors.service';
import { RegisterTutorDto } from 'src/tutors/dto/register-tutor.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { FilterDTO } from '../dto/filters.dto';
import { UpdateTutorDTO } from '../dto/update-tutor.dto';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  @Auth(ValidRoles.STUDENT, ValidRoles.ADMIN)
  public getTutors(@Query() query: FilterDTO) {
    return this.tutorsService.getTutors(query);
  }

  @Get(':id')
  @Auth(ValidRoles.STUDENT, ValidRoles.ADMIN)
  public getTutorById(@Param('id') id: string) {
    return this.tutorsService.getTutorById(id);
  }

  @Post('register')
  public register(@Body() registerTutorDto: RegisterTutorDto) {
    return this.tutorsService.register(registerTutorDto);
  }

  @Patch(':id')
  @Auth(ValidRoles.TUTOR, ValidRoles.ADMIN)
  public updateTutor(
    @Param('id') id: string,
    @Body() updateTutorDto: UpdateTutorDTO,
  ) {
    return this.tutorsService.updateTutor(id, updateTutorDto);
  }
}
