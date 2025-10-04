import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { BankTypeNames } from '../interfaces/bank-type.interface';

export class CreateBankDto {
  @ValidateIf((o: CreateBankDto) => o.bankType === BankTypeNames.BANK)
  @IsString()
  public accountNumber: string;

  @ValidateIf((o: CreateBankDto) => o.bankType === BankTypeNames.PAYPAL)
  @IsEmail()
  public email: string;

  @ValidateIf((o: CreateBankDto) => o.bankType === BankTypeNames.BANK)
  @IsString()
  public bankName: string;

  @IsOptional()
  @IsString()
  public rutTitular?: string;

  @IsString()
  @IsIn([BankTypeNames.BANK, BankTypeNames.PAYPAL])
  public bankType: BankTypeNames;
}
