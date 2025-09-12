import { Injectable } from '@nestjs/common'

@Injectable()
export class TutorsService {
    
    getTutors() {
        return {
            name : 'Pepe'
        };
    }

}