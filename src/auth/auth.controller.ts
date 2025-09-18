import { Body, Controller, Post } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }
}
