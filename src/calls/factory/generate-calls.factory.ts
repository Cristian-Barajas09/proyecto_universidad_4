import { Injectable } from '@nestjs/common';
import { CallsAdapter } from '../intefaces/calls-adapter.interface';
import { ZoomAdapter } from '../adapters/zoom.adapter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GenerateCallsFactory {
  public constructor(private readonly configService: ConfigService) {}

  create(): CallsAdapter {
    return new ZoomAdapter(
      this.configService.getOrThrow<string>('ZOOM_CLIENT_ID'),
      this.configService.getOrThrow<string>('ZOOM_CLIENT_SECRET'),
      this.configService.getOrThrow<string>('ZOOM_ACCOUNT_ID'),
      this.configService.getOrThrow<string>('ZOOM_URL'),
    );
  }
}
