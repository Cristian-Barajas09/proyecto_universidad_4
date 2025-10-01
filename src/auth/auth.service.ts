import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';
import { ValidRoles } from './interfaces/valid-roles.interface';
import { TutorsService } from 'src/tutors/services/tutors.service';
import { Tutor } from 'src/tutors/entity/tutor.entity';
import { Student } from 'src/students/entities/student.entity';
import { StudentsService } from 'src/students/students.service';

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
    private readonly tutorsService: TutorsService,
    private readonly studentsService: StudentsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO) {
    const user = await this.usersService.findByEmail(loginDto.email, [
      '+password',
      '-__v',
    ]);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.encryptPassword.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Correo o contraseña incorrecta');
    }

    const token = this.jwtService.sign({ email: user.email });
    const { password, ...userWithoutPassword } = user.toObject();

    if (user.rol === ValidRoles.TUTOR) {
      const tutor = await this.tutorsService.findByUserId(user._id as string);
      if (!tutor) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        ...userWithoutPassword,
        tutor: tutor as unknown as Tutor,
        token,
      };
    }

    if (user.rol === ValidRoles.STUDENT) {
      const student = await this.studentsService.findByUserId(
        user._id as string,
      );
      if (!student) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        ...userWithoutPassword,
        student: student as unknown as Student,
        token,
      };
    }

    return { ...userWithoutPassword, token };
  }
}
