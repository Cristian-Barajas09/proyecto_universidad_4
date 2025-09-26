import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import { TutorsService } from 'src/tutors/services/tutors.service';
import { ValidRoles } from '../interfaces/valid-roles.interface';
import { StudentsService } from 'src/students/students.service';
import { Tutor } from 'src/tutors/entity/tutor.entity';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly tutorsService: TutorsService,
    private readonly studentsService: StudentsService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.email, []);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    if (user.rol === ValidRoles.TUTOR) {
      const tutor = await this.tutorsService.findByUserId(user._id as string);
      if (!tutor) {
        throw new UnauthorizedException('Invalid token');
      }

      return { ...user.toObject(), tutor: tutor as unknown as Tutor };
    }

    if (user.rol === ValidRoles.STUDENT) {
      const student = await this.studentsService.findByUserId(
        user._id as string,
      );
      if (!student) {
        throw new UnauthorizedException('Invalid token');
      }
      return { ...user.toObject(), student: student as unknown as Student };
    }

    return user;
  }
}
