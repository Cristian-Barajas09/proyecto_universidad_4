import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

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
  @Auth(ValidRoles.ADMIN)
  public deleteUser(@Param('userId', ParseMongoIdPipe) userId: string) {
    return this.usersService.deleteById(userId);
  }
}
