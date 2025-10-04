import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChatsService } from 'src/chats/chats.service';
import { ChatsGateway } from 'src/chats/chats.gateway';
import { SchedulesService } from 'src/schedules/schedules.service';
import { GenerateCallsFactory } from './factory/generate-calls.factory';
import { InjectModel } from '@nestjs/mongoose';
import { Call } from './entities/call.entity';
import { Model } from 'mongoose';
import {
  Schedule,
  ScheduleStatus,
} from 'src/schedules/entities/schedule.entity';

@Injectable()
export class CallsService {
  public constructor(
    @InjectModel(Call.name)
    private readonly callModel: Model<Call>,
    private readonly callsFactory: GenerateCallsFactory,
    private readonly chatsService: ChatsService,
    private readonly chatsGateway: ChatsGateway,
    @Inject(forwardRef(() => SchedulesService))
    private readonly schedulesService: SchedulesService,
  ) {}

  @Cron('*/5 * * * *')
  public async handleCron() {
    const schedules = await this.schedulesService.getAllNextSchedules();

    for (const schedule of schedules) {
      const chat = await this.chatsService.getChatByBetweenUsers(
        schedule.tutor.user._id.toString(),
        schedule.student.user._id.toString(),
      );

      if (schedule.call.isSended) {
        continue;
      }

      if (!chat) {
        continue;
      }

      const call = await this.callModel.findById(schedule.call._id).exec();

      if (!call) {
        continue;
      }

      const message = await this.chatsService.sendMessage(
        chat.participants[0]._id?.toString() || '',
        chat._id?.toString() || '',
        JSON.stringify({
          tutorLink: call.tutorLink,
          studentLink: call.studentLink,
          scheduleId: schedule._id?.toString() || '',
        }),
      );

      this.chatsGateway.webSocketServer
        .to(chat._id?.toString() || '')
        .emit('message-from-server', message);
      call.isSended = true;
      await call.save();
      await this.schedulesService.updateStatus(
        schedule._id?.toString() || '',
        ScheduleStatus.PROGRESS,
      );

      console.log(
        'Call links sent to chat ' + chat._id?.toString() ||
          '' + ' for schedule ' + schedule._id?.toString() ||
          '',
      );
    }
  }

  public async generateLinkForSchedule(schedule: Schedule) {
    const callFactory = this.callsFactory.create();
    const topic = 'Clase de prueba';

    const call = await callFactory.makeCall({
      topic: topic,
      date: schedule.date,
    });

    const newCall = await this.callModel.create({
      tutorLink: call.startUrl,
      studentLink: call.joinUrl,
      schedule: schedule._id,
      isSended: false,
    });

    await newCall.save();

    return newCall;
  }
}
