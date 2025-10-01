import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './entities/schedule.entity';
import { TutorsModule } from 'src/tutors/tutors.module';
import { StudentsModule } from 'src/students/students.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
  imports: [
    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    TutorsModule,
    StudentsModule,
    ChatsModule,
  ],
})
export class SchedulesModule {}
