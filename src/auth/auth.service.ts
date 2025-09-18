import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  ENCRYPT_ADAPTER_TOKEN,
  type EncryptPasswordAdapter,
} from 'src/common/interfaces/encrypt.interface';

@Injectable()
export class AuthService {
  public constructor(
    private readonly usersService: UsersService,
    @Inject(ENCRYPT_ADAPTER_TOKEN)
    private readonly encryptPassword: EncryptPasswordAdapter,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.encryptPassword.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return {
      ...user.toJSON(),
      token: this.jwtService.sign({ email: user.email }),
    };
  }
}
