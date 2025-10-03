import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';

import 'dayjs/locale/es';
import { SchedulesService } from './schedules.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

import type { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { RescheduleDTO } from './dto/reschedule.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('schedules')
export class SchedulesController {
  public constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Auth(ValidRoles.STUDENT)
  public create(
    @GetUser() user: AuthenticatedUser,
    @Body() createScheduleDTO: CreateScheduleDto,
  ) {
    return this.schedulesService.create(createScheduleDTO, user);
  }

  @Get('my-schedules')
  @Auth()
  public getMySchedules(@GetUser() user: AuthenticatedUser) {
    return this.schedulesService.getMySchedules(user);
  }

  @Patch('reschedule/:oldScheduleId')
  @Auth(ValidRoles.STUDENT, ValidRoles.TUTOR, ValidRoles.ADMIN)
  public async reschedule(
    @Param('oldScheduleId', ParseMongoIdPipe) oldScheduleId: string,
    @Body() rescheduleDTO: RescheduleDTO,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.schedulesService.reschedule(oldScheduleId, rescheduleDTO, user);
  }

  @Get('me/next-schedule')
  @Auth(ValidRoles.STUDENT, ValidRoles.TUTOR)
  public getMyNextSchedule(@GetUser() user: AuthenticatedUser) {
    return this.schedulesService.getMyNextSchedule(user);
  }
}
