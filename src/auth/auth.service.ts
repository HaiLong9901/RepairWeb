import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthSignUpRequestDto } from './dto/auth-signup.dto';
import * as argon from 'argon2';
import { Role } from 'src/enum/role';
import { UserStatus } from 'src/enum/user-status';
import { generateVNeseAccName } from 'src/utils/formatString';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthSignInRequestDto } from './dto/auth-signin.dto';

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
      const accName =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        userId.slice(7, userId.length);
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
          gender: dto.gender,
        },
      });

      delete user.password;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new ForbiddenException('Tài khoản đã tồn tại');
      }
      throw error;
    }
  }

  async signIn(dto: AuthSignInRequestDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        phone: dto.phone,
      },
    });

    if (!user) {
      throw new ForbiddenException('Tài khoản không tông tại');
    }

    const passwordMatch = await argon.verify(user.password, dto.password);

    if (!passwordMatch) {
      throw new ForbiddenException('Sai mật khẩu');
    }

    return this.signToken(user.userId, user.phone);
  }

  generateCustomerId(phone: string) {
    const date = Date.now().toString();
    const id =
      'CUS' +
      phone.slice(phone.length - 4, phone.length) +
      date.slice(date.length - 4, date.length);
    return id;
  }

  async signToken(
    userId: string,
    phone: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      phone,
    };
    const secret = this.config.get('JWT_SECRET');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '1m',
      secret: secret,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: secret,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
