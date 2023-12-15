import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressRequestDto } from './dto/request.dto';
import { Role } from 'src/enum/role';
import { User } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async createAdress(dto: AddressRequestDto, user: User) {
    if (user.userId !== dto.userId && user.role !== Role.ROLE_ADMIN) {
      return new ForbiddenException(
        'You are not permitted to create this info',
      );
    }
    try {
      const existedUser = this.prisma.user.findUnique({
        where: {
          userId: dto.userId,
        },
      });

      if (!existedUser) {
        return new NotFoundException('User is not found');
      }

      const { isMainAddress } = dto;
      if (isMainAddress) {
        await this.prisma.userAddress.updateMany({
          where: {
            userId: dto.userId,
          },
          data: {
            isMainAddress: false,
          },
        });
      }
      await this.prisma.userAddress.create({
        data: {
          ...dto,
          isActive: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateAddess(dto: AddressRequestDto, user: User) {
    if (user.userId !== dto.userId && user.role !== Role.ROLE_ADMIN) {
      return new ForbiddenException(
        'You are not permitted to create this info',
      );
    }
    try {
      const existedAddress = await this.prisma.userAddress.findUnique({
        where: {
          addressId: dto.addressId,
        },
      });

      if (!existedAddress) {
        throw new NotFoundException("User's address is not found");
      }
      const { isMainAddress } = dto;
      if (isMainAddress) {
        await this.prisma.userAddress.updateMany({
          where: {
            userId: dto.userId,
          },
          data: {
            isMainAddress: false,
          },
        });
      }
      const updatedAddress = await this.prisma.userAddress.update({
        data: {
          ...dto,
        },
        where: {
          addressId: dto.addressId,
        },
      });

      return updatedAddress;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteAddress(addressId: number, userId: string) {
    try {
      const existedAddress = await this.prisma.userAddress.findUnique({
        where: {
          addressId,
          userId,
        },
      });

      if (!existedAddress) {
        throw new NotFoundException("User's address is not found");
      }

      await this.prisma.userAddress.update({
        where: {
          addressId,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllUserAddress(requestedUserId: string, user: User) {
    const { userId, role } = user;

    if (userId !== requestedUserId && role !== Role.ROLE_ADMIN) {
      return new ForbiddenException('You are not permit to change this asset');
    }
    try {
      const existedUser = await this.prisma.user.findUnique({
        where: {
          userId: requestedUserId,
        },
      });

      if (!existedUser) {
        throw new NotFoundException('User is not found');
      }

      const addressList = await this.prisma.userAddress.findMany({
        where: {
          userId: requestedUserId,
          isActive: true,
        },
      });

      return addressList;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
