import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController');

  public constructor(private readonly usersService: UsersService) {}

  @Get()
  public getUsers() {
    const users = this.usersService.getUsers();

    this.logger.log(users);

    return users;
  }

  @Post()
  public createUser(@Body() createUserDTO: CreateUserDTO) {
    return createUserDTO;
  }

  @Get(':userId')
  public getUserById(@Param('userId', ParseIntPipe) userId: number) {
    return {
      userId,
    };
  }

  @Delete(':userId')
  public deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return {
      userId,
    };
  }

  @Patch(':userId')
  public updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateDTO: UpdateUserDTO,
  ) {
    return updateDTO;
  }
}
