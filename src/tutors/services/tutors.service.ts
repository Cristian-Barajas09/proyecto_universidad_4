import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tutor } from 'src/tutors/entity/tutor.entity';
import { Model, Types } from 'mongoose';
import { Specialty } from 'src/tutors/entity/specialty.entity';
import { User } from 'src/users/entities/user.entity';
import { RegisterTutorDto } from 'src/tutors/dto/register-tutor.dto';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { JwtService } from '@nestjs/jwt';
import { FilterDTO } from '../dto/filters.dto';

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

  public async getTutors(query: FilterDTO) {
    const {
      page = 1,
      limit = 10,
      specialties,
      rating,
      price,
      recent,
      name,
    } = query;
    const filter: Record<string, any> = { verified: true };
    const offset = (page - 1) * limit;

    if (specialties && specialties.length > 0) {
      filter.specialties = { $in: specialties };
    }

    if (rating) {
      filter.rating = { $gte: rating };
    }

    if (price) {
      filter.price = { $lte: price };
    }

    if (recent) {
      filter.createdAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    if (name) {
      const users = await this.userModel
        .find({
          fullName: { $regex: name, $options: 'i' },
        })
        .select('_id');
      const userIds = users.map((u) => u._id);
      filter.user = { $in: userIds };
    }

    return await this.tutorModel
      .find(filter)
      .skip(offset)
      .limit(limit)
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .exec();
  }

  public getTutorById(id: string) {
    return this.tutorModel
      .findById(id)
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .exec();
  }

  public async register(registerTutorDto: RegisterTutorDto) {
    if (await this.userModel.exists({ email: registerTutorDto.email })) {
      throw new BadRequestException('Email already in use');
    }

    const specialties = await this.specialtyModel.find({
      _id: { $in: registerTutorDto.specialties },
    });

    const user = await this.userModel.create({
      fullName: registerTutorDto.fullName,
      email: registerTutorDto.email,
      password: await this.encryptPassword.encrypt(registerTutorDto.password),
      rol: ValidRoles.TUTOR,
    });

    await user.save();

    const tutor = await this.tutorModel.create({
      specialties: specialties.map((specialty) => specialty._id),
      price_per_hour: 0,
      biografy: '',
      user: user._id as Types.ObjectId,
      verified: false,
    });

    await tutor.save();

    return {
      ...tutor.toJSON(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }

  public async findByUserId(userId: string) {
    return await this.tutorModel
      .findOne({ user: userId })
      .populate<{ user: User }>('user')
      .populate<{ specialties: Specialty[] }>('specialties')
      .exec();
  }
}
