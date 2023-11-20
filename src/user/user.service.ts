import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatus } from 'src/enum/user-status';
import { Role } from 'src/enum/role';
import {
  ChangePasswordDto,
  CreateUserReqestDto,
  SelfUpdateUserDto,
  UpdateUserRequestDto,
} from './dto/request';
import { generateUserId } from 'src/utils/generateUserId';
import { generateVNeseAccName } from 'src/utils/formatString';
import * as argon from 'argon2';
import { admin, customer, repairman, superAdmin } from './dto/mockdata';
import { CartService } from 'src/cart/cart.service';
import { UserResponseDto } from './dto/response';
import { User } from '@prisma/client';
@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async onModuleInit() {
    this.prisma.cleanDb();
    await this.createUser(customer);
    await this.createUser(admin);
    await this.createUser(repairman);
    await this.createUser(superAdmin);
  }

  async getUserById(userId: string) {
    if (!userId || userId.length === 0) {
      throw new ForbiddenException('UserId is not valid');
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
        include: {
          repairmanSkill: {
            include: {
              skill: true,
            },
          },
          address: true,
        },
      });

      if (!user) {
        return new NotFoundException('User is not found');
      }

      return UserResponseDto.formatDto(user);
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

      const users = await this.prisma.user.findMany({
        ...queryParams,
        include: {
          repairmanSkill: {
            include: {
              skill: true,
            },
          },
        },
      });
      return users.map((user) => UserResponseDto.formatDto(user));
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

      const hashPassword = await argon.hash(dto.password);
      const userId = generateUserId(phone, role);
      const account =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        userId.slice(7, userId.length);
      const data = { ...dto };
      delete data.skills;
      const user = await this.prisma.user.create({
        data: {
          ...data,
          status: UserStatus.ACTIVE,
          accountName: account,
          userId,
          password: hashPassword,
        },
        include: {
          repairmanSkill: true,
        },
      });
      if (
        Array.isArray(dto.skills) &&
        dto.skills.length > 0 &&
        dto.role === Role.ROLE_REPAIRMAN
      ) {
        await Promise.all(
          dto.skills.map(
            async (skillId: number) =>
              await this.prisma.repairmanSkill.create({
                data: {
                  userId: user.userId,
                  skillId: skillId,
                },
              }),
          ),
        );
      }
      return UserResponseDto.formatDto(user);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(dto: UpdateUserRequestDto) {
    try {
      const existedUser = await this.prisma.user.findUnique({
        where: {
          userId: dto.userId,
        },
        include: {
          repairmanSkill: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!existedUser) {
        throw new NotFoundException('User is not found');
      }

      if (existedUser.email !== dto.email) {
        const existedEmail = await this.prisma.user.findUnique({
          where: {
            email: dto.email,
          },
        });

        if (existedEmail) {
          throw new ForbiddenException('Email has already used');
        }
      }

      if (existedUser.phone !== dto.phone) {
        const existedPhone = await this.prisma.user.findUnique({
          where: {
            phone: dto.phone,
          },
        });

        if (existedPhone) {
          throw new ForbiddenException('Phone number has been used');
        }
      }

      const account =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        dto.userId.slice(7, dto.userId.length);
      const updatedUser = await this.prisma.user.update({
        where: {
          userId: dto.userId,
        },
        data: {
          accountName: account,
          lastName: dto.lastName,
          firstName: dto.firstName,
          imageUrl: dto.imageUrl,
          gender: dto.gender,
          dob: dto.dob,
          phone: dto.phone,
          email: dto.email,
        },
      });

      if (
        Array.isArray(dto.skills) &&
        dto.skills.length > 0 &&
        existedUser.role === Role.ROLE_REPAIRMAN
      ) {
        await this.prisma.repairmanSkill.deleteMany({
          where: {
            userId: existedUser.userId,
          },
        });

        Promise.all(
          dto.skills.map(
            async (skillId: number) =>
              await this.prisma.repairmanSkill.create({
                data: {
                  userId: existedUser.userId,
                  skillId: skillId,
                },
              }),
          ),
        );
      }
      return UserResponseDto.formatDto(updatedUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async switchUserActiveStatus(userId: string, user: User) {
    if (!userId || userId.length === 0) {
      throw new BadRequestException('Missing userId');
    }

    try {
      const existedUser = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });

      if (!existedUser) {
        throw new NotFoundException('User is not found');
      }

      if (
        (existedUser.role === Role.ROLE_ADMIN &&
          user.role !== Role.ROLE_SUPERADMIN) ||
        existedUser.status === UserStatus.BUSY
      ) {
        throw new ForbiddenException(
          'You are not permitted to update this information',
        );
      }

      await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          status:
            existedUser.status === UserStatus.ACTIVE
              ? UserStatus.INACTIVE
              : UserStatus.ACTIVE,
        },
      });

      return { message: "switch user's account status successfully" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateRepairmanStatus(userId: string, status: number) {
    if (status !== UserStatus.INACTIVE) {
      throw new ForbiddenException(
        'You are not permitted to inactive your account',
      );
    }

    try {
      await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          status,
        },
      });

      return { message: 'Update status successfully' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });

      const isMatch = await argon.verify(user.password, dto.oldPassword);
      if (!isMatch) {
        throw new ForbiddenException('Password is wrong');
      }

      const hashPassword = await argon.hash(dto.newPassword);
      await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          password: hashPassword,
        },
      });

      return { message: 'Change password successfully' };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async selfUpdateProfile(userId: string, dto: SelfUpdateUserDto) {
    try {
      const account =
        generateVNeseAccName(dto.lastName + ' ' + dto.firstName) +
        userId.slice(7, userId.length);
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          ...dto,
          accountName: account,
        },
      });
      return UserResponseDto.formatDto(updatedUser);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
