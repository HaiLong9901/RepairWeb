import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpRequestDto } from './dto/auth-signup.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AuthSignInRequestDto,
  AuthSignInResponseDto,
} from './dto/auth-signin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
}
