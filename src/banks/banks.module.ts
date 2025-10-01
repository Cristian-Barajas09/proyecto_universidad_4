import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankAccount, BankSchema } from './entity/bank-accounts.entity';
import { BankType, BankTypeSchema } from './entity/bank-type.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankSchema },
      { name: BankType.name, schema: BankTypeSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class BanksModule {}
