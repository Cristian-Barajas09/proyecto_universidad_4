import { Controller , Get } from "@nestjs/common";
import { TutorsService } from "./tutors.service";

@Controller('tutors')
export class TutorsController{

    constructor (
        private readonly tutorsService : TutorsService
    ){}

    @Get()
    public getTutors () {
        return this.tutorsService.getTutors()
    }

}