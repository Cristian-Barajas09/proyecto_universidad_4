import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';

@Module({
  imports: [UsersModule,TutorsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
