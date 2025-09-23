import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  public constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public getUsers() {
    return this.userModel.find().exec();
  }

  public findByEmail(email: string, fields: string[]) {
    return this.userModel
      .findOne({
        email: email,
      })
      .populate('student')
      .select(fields)
      .exec();
  }

  public async findById(id: string) {
    return this.userModel.findById(id).populate('student').exec();
  }

  public async deleteById(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userModel.findByIdAndDelete(id).exec();
  }
}
