import { IsDateString, IsString } from 'class-validator';

export class CertificationDto {
  @IsString()
  public title: string;
  @IsString()
  public fileUrl: string;

  @IsString()
  public institute: string;

  @IsString()
  @IsDateString()
  public date: Date;
}
