import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { formatBigInt } from 'src/utils/formatResponse';
import { OtpService } from 'src/otp/otp.service';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private otpService: OtpService,
    private cartService: CartService,
  ) {}

  async signUp(dto: AuthSignUpRequestDto) {
    try {
      const hashPassword = await argon.hash(dto.password);
      const userId = this.generateCustomerId(dto.phone);
      const accName =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        userId.slice(7, userId.length);
      const existedPhone = await this.prisma.user.findUnique({
        where: {
          phone: dto.phone,
          status: {
            not: UserStatus.INACTIVE,
          },
        },
      });

      if (existedPhone) {
        throw new ForbiddenException('Phone number has been used');
      }

      const existedEmail = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existedEmail) {
        throw new ForbiddenException('Email has been used');
      }
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
      await this.otpService.sendOtp(user);
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
        NOT: {
          status: UserStatus.INACTIVE,
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Account does not exist');
    }

    const passwordMatch = await argon.verify(user.password, dto.password);

    if (!passwordMatch) {
      throw new ForbiddenException('Password is wrong');
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
      expiresIn: '1d',
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

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });

      delete user.password;
      return formatBigInt(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async resendOtp(email: string, phone: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
          phone,
          status: UserStatus.INACTIVE,
        },
      });

      if (!user) {
        return new NotFoundException('User is not found');
      }

      await this.otpService.sendOtp(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
