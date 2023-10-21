import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatus } from 'src/enum/user-status';
import { formatBigInt } from 'src/utils/formatResponse';
import { Role } from 'src/enum/role';
import { CreateUserReqestDto } from './dto/request';
import { generateUserId } from 'src/utils/generateUserId';
import { generateVNeseAccName } from 'src/utils/formatString';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    if (!userId || userId.length === 0) {
      throw new ForbiddenException('UserId is not valid');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });

      if (!user) {
        return new NotFoundException('User is not found');
      }

      return formatBigInt(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllUser(query: any) {
    const { role, status, name } = query;
    if (role && !(role in Role)) {
      throw new ForbiddenException('Role is not found');
    }

    if (status && !(status in UserStatus)) {
      throw new ForbiddenException('Status is not found');
    }

    try {
      const queryParams: any = {
        where: {},
      };

      if (role) {
        queryParams.where.role = parseInt(role);
      }

      if (status) {
        queryParams.where.status = parseInt(status);
      } else {
        queryParams.where.status = { not: UserStatus.INACTIVE };
      }

      if (name && name.length > 0) {
        queryParams.where.OR = [
          {
            lastName: {
              mode: 'insensitive',
              contains: name,
            },
          },
          {
            firstName: {
              mode: 'insensitive',
              contains: name,
            },
          },
        ];
      }

      const users = await this.prisma.user.findMany(queryParams);
      return users.map((user) => formatBigInt(user));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createUser(dto: CreateUserReqestDto) {
    const { email, phone, role } = dto;
    if (!(role in Role)) {
      throw new NotFoundException('Role is not found');
    }
    try {
      const existedEmail = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      const existedPhone = await this.prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (existedEmail) {
        throw new ForbiddenException(
          'Email has already been used by other account. Please use another email',
        );
      }

      if (existedPhone) {
        throw new ForbiddenException(
          'Phone number has already been used by other account. Please use another phone number',
        );
      }

      const userId = generateUserId(phone, role);
      const account =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        userId.slice(7, userId.length);
      const user = await this.prisma.user.create({
        data: {
          ...dto,
          status: UserStatus.ACTIVE,
          accountName: account,
          userId,
        },
        include: {
          repairmanSkill: true,
        },
      });
      return formatBigInt(user);
    } catch (error) {}
  }
}
