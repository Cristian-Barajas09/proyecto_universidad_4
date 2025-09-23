import { Module } from '@nestjs/common';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tutor, TutorSchema } from './entity/tutor.entity';
import { Specialty, SpecialtySchema } from './entity/specialty.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [TutorsController],
  providers: [TutorsService],
  imports: [
    MongooseModule.forFeature([
      { name: Tutor.name, schema: TutorSchema },
      { name: Specialty.name, schema: SpecialtySchema },
    ]),
    UsersModule,
  ],
})
export class TutorsModule {}
