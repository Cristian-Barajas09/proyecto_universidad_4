import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersModule } from './users/users.module';
import { TutorsModule } from './tutors/tutors.module';
import { StudentsModule } from './students/students.module';
import { AuthModule } from './auth/auth.module';

import { appConfig } from './config/app.config';
import { validationSchema } from './config/joi.config';
import { SchedulesModule } from './schedules/schedules.module';
import { ChatsModule } from './chats/chats.module';
import { CallsModule } from './calls/calls.module';

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
    SchedulesModule,
    ChatsModule,
    CallsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
