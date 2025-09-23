import { IsString , IsNumber , MaxLength , MinLength } from "class-validator"


export class CreateTutorDto {

    @IsString()
    @MaxLength(4)
    public name : string
    
    @IsString()
    public email : string

    @IsString()
    @MinLength(8)
    public password : string



    // public ci : number
    // public phoneNumber : number

}