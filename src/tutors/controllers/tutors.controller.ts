import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TutorsService } from 'src/tutors/services/tutors.service';
import { RegisterTutorDto } from 'src/tutors/dto/register-tutor.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { FilterDTO } from '../dto/filters.dto';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  @Auth(ValidRoles.STUDENT, ValidRoles.ADMIN)
  public getTutors(@Query() query: FilterDTO) {

    return this.tutorsService.getTutors(query);
  }

  @Post('register')
  public register(@Body() registerTutorDto: RegisterTutorDto) {
    return this.tutorsService.register(registerTutorDto);
  }
}
