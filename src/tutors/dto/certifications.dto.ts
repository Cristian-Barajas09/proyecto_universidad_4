import { IsString } from 'class-validator';

export class CertificationDto {
  @IsString()
  public title: string;
  @IsString()
  public fileUrl: string;

  @IsString()
  public institute: string;

  @IsString()
  public date: string;
}
