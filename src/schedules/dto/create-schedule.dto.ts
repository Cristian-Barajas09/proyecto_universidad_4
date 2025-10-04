import { IsISO8601, IsMongoId, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsMongoId()
  public studentId: string;

  @IsMongoId()
  public tutorId: string;

  @IsISO8601()
  public date: string;

  @IsString()
  public topic: string;
}
