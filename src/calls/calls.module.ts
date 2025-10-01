import { forwardRef, Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { GenerateCallsFactory } from './factory/generate-calls.factory';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from 'src/chats/chats.module';
import { SchedulesModule } from 'src/schedules/schedules.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Call, CallSchema } from './entities/call.entity';

@Module({
  controllers: [CallsController],
  imports: [
    forwardRef(() => SchedulesModule),
    MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }]),
    ConfigModule,
    ChatsModule,
  ],
  providers: [CallsService, GenerateCallsFactory],
  exports: [CallsService, MongooseModule],
})
export class CallsModule {}
