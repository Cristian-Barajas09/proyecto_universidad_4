import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  public create(createStudentDto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  public findAll() {
    return `This action returns all students`;
  }

  public findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  public update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  public remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
