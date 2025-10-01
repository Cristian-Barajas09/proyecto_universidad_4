import { IsString, MinLength } from 'class-validator';

export class NewMessageDTO {
  @IsString()
  @MinLength(1)
  public message: string;

  @IsString()
  public chatId: string;
}
