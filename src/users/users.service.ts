import { Injectable } from '@nestjs/common';

type User = {
  name: string;
  age: number;
};

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      name: 'Cristian',
      age: 21,
    },
  ];

  public getUsers() {
    return this.users;
  }

  public createUser() {}
}
