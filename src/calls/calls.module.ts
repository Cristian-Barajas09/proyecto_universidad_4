import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { GenerateCallsFactory } from './factory/generate-calls.factory';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [CallsController],
  imports: [ConfigModule],
  providers: [CallsService, GenerateCallsFactory],
})
export class CallsModule {}
