import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterStudentDto } from './dto/register-student.dto';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { JwtService } from '@nestjs/jwt';
import { Student } from './entities/student.entity';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

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

    const user = await this.userModel.create({
      fullName: registerStudentDto.fullName,
      email: registerStudentDto.email,
      password: await this.encryptPassword.encrypt(registerStudentDto.password),
      identityDocument: registerStudentDto.identityDocument,
      rol: ValidRoles.STUDENT,
    });
    await user.save();

    const student = await this.studentModel.create({
      university: registerStudentDto.university,
      user: user._id,
    });

    await student.save();

    return {
      ...student.toJSON(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }

  public async getAllStudents() {
    return this.studentModel.find().populate('user').exec();
  }

  public async getStudentById(id: string) {
    return this.studentModel
      .findById(id)
      .populate<{ user: User }>('user')
      .exec();
  }

  public async findByUserId(userId: string) {
    return this.studentModel.findOne({ user: userId }).populate('user').exec();
  }

  public async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
    user: AuthenticatedUser,
  ) {
    console.log({ user });

    if (
      user.rol !== ValidRoles.ADMIN &&
      user?.student?._id?.toString() !== id
    ) {
      throw new BadRequestException(
        'You can only update your own student profile',
      );
    }

    const student = await this.getStudentById(id);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (
      updateStudentDto.fullName ||
      updateStudentDto.email ||
      updateStudentDto.password
    ) {
      const user = await this.userModel.findById(student.user);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (
        updateStudentDto.email &&
        updateStudentDto.email !== user.email &&
        (await this.userModel.exists({ email: updateStudentDto.email }))
      ) {
        throw new BadRequestException('Email already in use');
      }

      if (updateStudentDto.fullName) {
        user.fullName = updateStudentDto.fullName;
      }

      if (updateStudentDto.email) {
        user.email = updateStudentDto.email;
      }

      if (updateStudentDto.password) {
        user.password = await this.encryptPassword.encrypt(
          updateStudentDto.password,
        );
      }

      await user.save();
    }

    if (updateStudentDto.university) {
      student.university = updateStudentDto.university;
    }

    await student.save();

    return this.getStudentById(id);
  }
}
