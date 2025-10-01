import { IsISO8601 } from 'class-validator';

export class RescheduleDTO {
  @IsISO8601()
  date: string;
}
