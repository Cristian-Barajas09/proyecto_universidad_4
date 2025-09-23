import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor } from './entity/tutor.entity';
import { Model, Types } from 'mongoose';
import { Specialty } from './entity/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterTutorDto } from './dto/register-tutor.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TutorsService {
  public constructor(
    @InjectModel(Tutor.name)
    private readonly tutorModel: Model<Tutor>,
    @InjectModel(Specialty.name)
    private readonly specialtyModel: Model<Specialty>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
    private readonly jwtService: JwtService,
  ) {}

  public getTutors() {
    return this.tutorModel
      .find()
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .exec();
  }

  public async register(registerTutorDto: RegisterTutorDto) {
    if (await this.userModel.exists({ email: registerTutorDto.email })) {
      throw new BadRequestException('Email already in use');
    }

    const tutor = await this.tutorModel.create({});

    const user = await this.userModel.create({
      fullName: registerTutorDto.fullName,
      email: registerTutorDto.email,
      password: await this.encryptPassword.encrypt(registerTutorDto.password),
      rol: ValidRoles.STUDENT,
      student: tutor._id,
    });

    await user.save();

    tutor.user = user._id as Types.ObjectId;

    await tutor.save();

    return {
      ...user.toJSON(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }
}
