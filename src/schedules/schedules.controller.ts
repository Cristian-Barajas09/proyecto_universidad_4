import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';

import 'dayjs/locale/es';
import { SchedulesService } from './schedules.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';

@Controller('schedules')
export class SchedulesController {
  public constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Auth(ValidRoles.STUDENT)
  public create(@Body() createScheduleDTO: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDTO);
  }

  @Get('my-schedules')
  @Auth()
  public getMySchedules(@GetUser() user: AuthenticatedUser) {
    return this.schedulesService.getMySchedules(user);
  }
}
