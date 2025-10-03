import { forwardRef, Module } from '@nestjs/common';
import { TutorsController } from './controllers/tutors.controller';
import { TutorsService } from './services/tutors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tutor, TutorSchema } from './entity/tutor.entity';
import { Specialty, SpecialtySchema } from './entity/specialty.entity';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { SpecialtiesController } from './controllers/specialties.controller';
import {
  Certification,
  CertificationSchema,
} from './entity/certifications.entity';
import { SpecialtiesService } from './services/specialties.service';
import { PassportModule } from '@nestjs/passport';
import { BanksModule } from 'src/banks/banks.module';
import { SchedulesModule } from 'src/schedules/schedules.module';

@Module({
  controllers: [TutorsController, SpecialtiesController],
  providers: [TutorsService, SpecialtiesService],
  imports: [
    MongooseModule.forFeature([
      { name: Tutor.name, schema: TutorSchema },
      { name: Specialty.name, schema: SpecialtySchema },
      { name: Certification.name, schema: CertificationSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    CommonModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    BanksModule,
    forwardRef(() => SchedulesModule),
  ],
  exports: [TutorsService, SpecialtiesService, MongooseModule],
})
export class TutorsModule {}
