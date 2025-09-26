import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CreateCallDto } from './dto/create-call.dto';
import { UpdateCallDto } from './dto/update-call.dto';

@Injectable()
export class CallsService {
  // @Cron('*/5 * * * * *')
  // public handleCron() {
  //   console.log('Called every 5 seconds');
  // }
}
