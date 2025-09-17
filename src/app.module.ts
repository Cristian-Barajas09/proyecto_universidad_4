import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/proyecto_universidad_4'),
    UsersModule,
    TutorsModule,
    StudentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
