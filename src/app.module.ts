import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [UsersModule, TutorsModule, StudentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
