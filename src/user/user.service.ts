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
import { admin, customer, repairman, staff } from './dto/mockdata';
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
    // await this.prisma.cleanDb();
    // await this.createUser(customer);
    // await this.createUser(admin);
    // await this.createUser(repairman);
    // await this.createUser(superAdmin);
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

  async createUser(dto: CreateUserReqestDto, user: User) {
    const { email, phone, role } = dto;
    if (role === Role.ROLE_ADMIN && user.role !== Role.ROLE_ADMIN) {
      throw new ForbiddenException('Not permitted');
    }
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
        ((existedUser.role === Role.ROLE_ADMIN ||
          existedUser.role === Role.ROLE_STAFF) &&
          user.role !== Role.ROLE_ADMIN) ||
        existedUser.status === UserStatus.BUSY
      ) {
        throw new ForbiddenException(
          'You are not permitted to update this information',
        );
      }

      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          status:
            existedUser.status === UserStatus.ACTIVE
              ? UserStatus.INACTIVE
              : UserStatus.ACTIVE,
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

      return UserResponseDto.formatDto(updatedUser);
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
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          status,
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

      return UserResponseDto.formatDto(updatedUser);
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

  async createMultiUsers(dto: CreateUserReqestDto[], user: User) {
    // console.log(dto);
    const hasAdminRole = dto.some((user) => user.role === Role.ROLE_ADMIN);
    if (hasAdminRole && user.role !== Role.ROLE_ADMIN) {
      throw new ForbiddenException("You're not permitted");
    }
    try {
      const userList: any = await Promise.all(
        dto.map(async (user) => {
          const hashPassword = await argon.hash(user.password);
          const userId = generateUserId(user.phone, user.role);
          const account =
            generateVNeseAccName(user.lastName + ' ' + user.firstName) +
            userId.slice(7, userId.length);
          const userToCreate: CreateUserReqestDto = {
            ...user,
            accountName: account,
            password: hashPassword,
            userId,
            status: UserStatus.ACTIVE,
          };
          console.log({ userToCreate });
          return userToCreate;
        }),
      );

      console.log({ userList });

      await this.prisma.user.createMany({
        data: userList,
      });

      return {
        message: 'success',
      };
    } catch (error) {
      throw error;
    }
  }
}
