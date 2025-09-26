import { Injectable } from '@nestjs/common';
import { CallsAdapter } from '../intefaces/calls-adapter.interface';
import { ZoomAdapter } from '../adapters/zoom.adapter';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GenerateCallsFactory {

  public constructor(
    private readonly configService: ConfigService,
  ) {}

  create(): CallsAdapter {
    return new ZoomAdapter();
  }
}
