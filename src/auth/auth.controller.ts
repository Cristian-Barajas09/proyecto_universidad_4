import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Get('status')
  @Auth()
  public status(@GetUser() user: AuthenticatedUser) {
    return { data: user };
  }

  @Post('forget-password')
  public forgetPassword(@Body() body: { email: string }) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('verify-reset-code')
  public verifyResetCode(@Body() body: { email: string; code: string }) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Patch('reset-password')
  public resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
  ) {
    return this.authService.resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
  }
}
