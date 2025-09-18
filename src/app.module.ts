import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';

import { appConfig } from './config/app.config';
import { validationSchema } from './config/joi.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      load: [appConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
    }),
    UsersModule,
    TutorsModule,
    StudentsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
