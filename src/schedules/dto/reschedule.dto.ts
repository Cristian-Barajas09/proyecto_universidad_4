import { IsISO8601, IsString } from 'class-validator';

export class RescheduleDTO {
  @IsISO8601()
  date: string;

  @IsString()
  public topic: string;
}
