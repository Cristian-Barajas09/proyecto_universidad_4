import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  public constructor(private readonly usersService: UsersService) {}

  @Get()
  public getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  public createUser(@Body() createUserDTO: CreateUserDTO) {
    return createUserDTO;
  }
}
