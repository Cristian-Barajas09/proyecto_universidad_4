import { Controller, Post, Body, Get } from '@nestjs/common';
import { StudentsService } from './students.service';
import { RegisterStudentDto } from './dto/register-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('register')
  public async register(@Body() registerStudentDto: RegisterStudentDto) {
    return this.studentsService.register(registerStudentDto);
  }

  @Get()
  public async getAllStudents() {
    return this.studentsService.getAllStudents();
  }
}
