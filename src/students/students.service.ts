import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterStudentDto } from './dto/register-student.dto';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { JwtService } from '@nestjs/jwt';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  public constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
    private readonly jwtService: JwtService,
  ) {}

  public async register(registerStudentDto: RegisterStudentDto) {
    if (await this.userModel.exists({ email: registerStudentDto.email })) {
      throw new BadRequestException('Email already in use');
    }

    const student = await this.studentModel.create({
      university: registerStudentDto.university,
    });

    const user = await this.userModel.create({
      fullName: registerStudentDto.fullName,
      email: registerStudentDto.email,
      password: await this.encryptPassword.encrypt(registerStudentDto.password),
      identityDocument: registerStudentDto.identityDocument,
      rol: ValidRoles.STUDENT,
      student: student._id,
    });

    await user.save();

    student.user = user._id as Types.ObjectId;

    await student.save();

    return {
      ...user.toJSON(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }

  public async getAllStudents() {
    return this.userModel.find().populate('student').exec();
  }

  public async getStudentById(id: string) {
    return this.userModel.findById(id).populate('student').exec();
  }
}
