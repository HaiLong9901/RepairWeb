import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthSignUpRequestDto } from './dto/auth-signup.dto';
import * as argon from 'argon2';
import { Role } from 'src/enum/role';
import { UserStatus } from 'src/enum/user-status';
import { generateVNeseAccName } from 'src/utils/formatString';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthSignUpRequestDto) {
    const hashPassword = await argon.hash(dto.password);

    try {
      const userId = this.generateCustomerId(dto.phone);
      const accName = generateVNeseAccName(dto.lastName + ' ' + dto.firstName);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashPassword,
          phone: dto.phone,
          dob: dto.dob,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: Role.ROLE_USER,
          status: UserStatus.INACTIVE,
          userId: userId,
          accountName: accName,
        },
      });

      delete user.password;
    } catch (error) {}
  }

  generateCustomerId(phone: string) {
    const date = Date.now().toString();
    const id =
      'CUS' +
      phone.slice(phone.length - 4, phone.length) +
      date.slice(date.length - 4, date.length);
    return id;
  }

  // async signToken(userId: string, phone: string) {

  // }
}
