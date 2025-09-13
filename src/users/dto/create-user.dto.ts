import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  public name: string;

  @IsNumber()
  @Min(15)
  public age: number;
}
