import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  public constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  public getUsers() {
    return this.userModel.find().exec();
  }

  public findByEmail(email: string) {
    return this.userModel
      .findOne({
        email: email,
      })
      .populate('student')
      .exec();
  }

  public createUser() {}
}
