import { Module } from '@nestjs/common';
import { ENCRYPT_ADAPTER_TOKEN } from './interfaces/encrypt.interface';
import { BcryptAdapter } from './adapters/bcrypt.adapter';

@Module({
  providers: [
    {
      provide: ENCRYPT_ADAPTER_TOKEN,
      useClass: BcryptAdapter,
    },
  ],
  exports: [ENCRYPT_ADAPTER_TOKEN],
})
export class CommonModule {}
