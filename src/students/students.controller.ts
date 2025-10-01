import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { StudentsService } from './students.service';
import { RegisterStudentDto } from './dto/register-student.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { UpdateStudentDto } from './dto/update-student.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('register')
  public async register(@Body() registerStudentDto: RegisterStudentDto) {
    return this.studentsService.register(registerStudentDto);
  }

  @Get()
  @Auth(ValidRoles.ADMIN, ValidRoles.TUTOR)
  public async getAllStudents() {
    return this.studentsService.getAllStudents();
  }

  @Get(':id')
  @Auth(ValidRoles.ADMIN, ValidRoles.TUTOR)
  public async getStudentById(@Param('id') id: string) {
    return this.studentsService.getStudentById(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.ADMIN, ValidRoles.STUDENT)
  public async updateStudent(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.studentsService.updateStudent(id, updateStudentDto, user);
  }
}
