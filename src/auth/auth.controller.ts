import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpRequestDto } from './dto/auth-signup.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuthSignInRequestDto,
  AuthSignInResponseDto,
} from './dto/auth-signin.dto';
import { OtpService } from 'src/otp/otp.service';
import { JwtGuard } from './guard/jwt.guard';
import { UserResponseDto } from 'src/user/dto/response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'register account for user' })
  @ApiResponse({ type: AuthSignUpRequestDto })
  signUp(@Body() dto: AuthSignUpRequestDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  @ApiResponse({ type: AuthSignInResponseDto })
  signIn(@Body() dto: AuthSignInRequestDto) {
    return this.authService.signIn(dto);
  }

  @Post('updateRefreshToken')
  @ApiResponse({ type: AuthSignInResponseDto })
  updateRefreshToken(@Body() dto: AuthSignInRequestDto) {
    return this.authService.signToken(dto.phone, dto.password);
  }

  @Get('getOtp')
  getOtp(@Body() { email }: { email: string }) {
    return this.otpService.sendOtp(email);
  }

  @Get('getProfile')
  @UseGuards(JwtGuard)
  @ApiResponse({ type: UserResponseDto })
  getProfile(@Req() req) {
    const { userId } = req.user;
    return this.authService.getProfile(userId);
  }
}
