import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  public getUsers() {
    return {
      message: 'Hello world',
    };
  }
}
