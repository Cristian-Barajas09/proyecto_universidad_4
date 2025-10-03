import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { VerifyResetCode } from './dto/verify-reset-code.dto';
import { ForgetPassword } from './dto/forget-password.dto';

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
  public forgetPassword(@Body() body: ForgetPassword) {
    return this.authService.forgetPassword(body.email);
  }

  @Post('verify-reset-code')
  public verifyResetCode(@Body() body: VerifyResetCode) {
    return this.authService.verifyResetCode(body.email, body.code);
  }

  @Patch('reset-password')
  public resetPassword(@Body() body: ResetPasswordDTO) {
    return this.authService.resetPassword(
      body.email,
      body.code,
      body.newPassword,
    );
  }

  @Patch('change-password')
  @Auth()
  public changePassword(
    @GetUser() user: AuthenticatedUser,
    @Body() body: ChangePasswordDTO,
  ) {
    return this.authService.changePassword(
      user._id as string,
      body.oldPassword,
      body.password,
    );
  }
}
