import { forwardRef, Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './entities/student.entity';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { SchedulesModule } from 'src/schedules/schedules.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }]),
    CommonModule,
    forwardRef(() => AuthModule),
    forwardRef(() => SchedulesModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService, MongooseModule],
})
export class StudentsModule {}
