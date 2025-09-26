import { Controller } from '@nestjs/common';
import { CallsService } from './calls.service';


@Controller('calls')
export class CallsController {
  public constructor(private readonly callsService: CallsService) {}
}
