import { Injectable } from '@nestjs/common';

type Tutor = {
  name : string,
  email : string
  password : number,
}


@Injectable()
export class TutorsService {

  private tutors : Tutor[] = [
    {
      name : 'Frank',
      email : 'algo@gmail.com',
      password : 12345678
    }
  ]


  getTutors() {
    return  this.tutors
  }

  createTutor (){}
}
