import { User } from 'src/users/entities/user.entity';
import { Student } from 'src/students/entities/student.entity';
import { Tutor } from 'src/tutors/entity/tutor.entity';

export type AuthenticatedUser = User & {
  student?: Student | null;
  tutor?: Tutor | null;
};
