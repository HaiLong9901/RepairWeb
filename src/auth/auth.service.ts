import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
// import { AuthSignUpRequestDto } from './dto/auth-signup.dto';
// import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // async signUp(dto: AuthSignUpRequestDto) {
  //   const hashPassword = await argon.hash(dto.password);

  //   try {
  //     const user = await this.prisma.user.create({
  //       data: {
  //         email: dto.email,
  //         password: hashPassword,
  //         phone: dto.phone,
  //         dob: dto.dob,
  //         firstName: dto.firstName,
  //         lastName: dto.lastName,
  //       },
  //     });
  //   } catch (error) {}
  // }
}
