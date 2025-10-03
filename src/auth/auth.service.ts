import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { ApplicationErrors, errorMessages } from 'src/common/constants/errors';

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

  public async forgetPassword(email: string) {
    const user = await this.usersService.findByEmail(email, []);
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetCode = code;

    console.log(user.resetCode);

    await user.save();

    // todo: definir el servicio de envio de correos

    return { message: 'Reset code sent to email' };
  }

  public async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email, ['+resetCode']);
    if (!user || user.resetCode !== code) {
      throw new NotFoundException('Invalid email or code');
    }
    user.password = await this.encryptPassword.encrypt(newPassword);
    user.resetCode = undefined;
    await user.save();
    return { message: 'Password reset successful' };
  }

  public async verifyResetCode(email: string, code: string) {
    const user = await this.usersService.findByEmail(email, ['+resetCode']);
    if (!user || user.resetCode !== code) {
      throw new NotFoundException('Invalid email or code');
    }

    return { message: 'Code is valid' };
  }

  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId, ['+password']);
    if (!user) {
      throw new NotFoundException({
        message: 'usuario no encontrado',
        error: ApplicationErrors.RESOURCE_NOT_FOUND,
      });
    }

    const isOldPasswordValid = await this.encryptPassword.compare(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException({
        message: errorMessages.OLD_PASSWORD_INCORRECT,
        error: ApplicationErrors.OLD_PASSWORD_INCORRECT,
      });
    }

    user.password = await this.encryptPassword.encrypt(newPassword);
    await user.save();

    return { message: 'Password changed successfully' };
  }
}
