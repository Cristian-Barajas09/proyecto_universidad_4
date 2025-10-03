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
import { UsersService } from 'src/users/users.service';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Tutor } from 'src/tutors/entity/tutor.entity';

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
    private readonly usersService: UsersService,
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<Schedule>,
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

    const savedStudent = await this.getStudentById(student._id as string);
    if (!savedStudent) {
      throw new BadRequestException('Error creating student');
    }

    const savedUser = await this.usersService.findByEmail(user.email, []);

    if (!savedUser) throw new BadRequestException('User not found');

    return {
      ...savedUser.toObject(),
      student: savedStudent.toObject(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }

  public async getAllStudents() {
    return this.studentModel.find().populate('user').exec();
  }

  public async getStudentById(id: string) {
    const student = await this.studentModel
      .findById(id)
      .populate<{ user: User }>('user')
      .exec();

    if (!student) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return student;
  }

  public async findByUserId(userId: string) {
    return this.studentModel.findOne({ user: userId }).populate('user').exec();
  }

  public async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
    user: AuthenticatedUser,
  ) {
    if (
      user.rol !== ValidRoles.ADMIN &&
      user?.student?._id?.toString() !== id
    ) {
      throw new BadRequestException(
        'You can only update your own student profile',
      );
    }

    console.log('Updating student with ID:', id);
    console.log('Update data:', updateStudentDto);
    const student = await this.getStudentById(id);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (
      updateStudentDto.fullName ||
      updateStudentDto.email ||
      updateStudentDto.password ||
      updateStudentDto.photo
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

      if (updateStudentDto.photo) {
        console.log('Updating photo');
        console.log(updateStudentDto.photo);
        user.photo = updateStudentDto.photo;
      }

      await user.save();
    }

    if (updateStudentDto.university) {
      student.university = updateStudentDto.university;
    }

    await student.save();

    const savedStudent = await this.getStudentById(student._id as string);

    return savedStudent;
  }

  public async getLastTutorsByStudentId(studentId: string, limit = 5) {
    const student = await this.getStudentById(studentId);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const schedules = await this.scheduleModel
      .find({ student: student._id, status: { $ne: 'canceled' } })
      .sort({ date: -1 })
      .populate<{
        tutor: Tutor;
      }>({
        path: 'tutor',
        populate: [
          { path: 'user', model: 'User' },
          { path: 'specialties', model: 'Specialty' },
        ],
      })
      .exec();

    const uniqueTutors: Tutor[] = [];
    const tutorIds = new Set();

    for (const schedule of schedules) {
      const tutor = schedule.tutor;
      if (tutor && !tutorIds.has(tutor._id?.toString())) {
        uniqueTutors.push(tutor);
        tutorIds.add(tutor._id?.toString());
        if (uniqueTutors.length >= limit) break;
      }
    }

    return uniqueTutors;
  }

  public async getLastSchedulesByStudentIdAndTutorId(
    studentId: string,
    tutorId: string,
    limit = 5,
  ) {
    const student = await this.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const schedules = await this.scheduleModel
      .find({ student: student._id, tutor: tutorId })
      .sort({ date: -1 })
      .limit(limit)
      .populate<{
        student: Student;
      }>({
        path: 'student',
        model: 'Student',
      })
      .exec();

    return schedules;
  }
}
