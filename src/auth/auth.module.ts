import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from 'src/common/common.module';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    CommonModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
        signOptions: {
          expiresIn: '2h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
