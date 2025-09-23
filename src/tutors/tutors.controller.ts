import { Controller, Get, Post, Body } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { CreateTutorDto } from './dto/create-tutor.dto';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Get()
  public getTutors() {
    return this.tutorsService.getTutors();
  }

  @Post()
  public createTutors(@Body() createTutorDto: CreateTutorDto) {
    return createTutorDto;
  }
}
