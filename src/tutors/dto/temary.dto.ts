import { IsString } from 'class-validator';

export class TemaryDTO {
  @IsString()
  public title: string;

  @IsString()
  public description: string;
}
