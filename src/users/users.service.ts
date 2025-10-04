import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Injectable()
export class UsersService {
  public constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
  ) {}

  public getUsers() {
    return this.userModel.find().exec();
  }

  public findByEmail(email: string, fields: string[]) {
    return this.userModel
      .findOne({
        email: email,
      })
      .select(fields)
      .exec();
  }

  public async findById(id: string, fields: string[] = []) {
    return this.userModel.findById(id).select(fields).exec();
  }

  public async deleteById(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.userModel.findByIdAndDelete(id).exec();
  }

  public async generateUsers(): Promise<User[]> {
    const users: User[] = [];
    const roles = [ValidRoles.ADMIN, ValidRoles.STUDENT, ValidRoles.TUTOR];

    for (let i = 0; i < 10; i++) {
      const user = new this.userModel({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: this.encryptPassword.encrypt('password123'),
        role: roles[i % roles.length],
        phoneNumber: `123-456-789${i}`,
        identityDocument: `ID${i + 1}`,
        photo: `https://example.com/photos/user${i + 1}.jpg`,
      });

      users.push(user);
    }

    await this.userModel.insertMany(users);

    return users;
  }
}
