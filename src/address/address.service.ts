import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from './dto/request.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async createAdress(dto: CreateAddressRequestDto, userId: string) {
    try {
      const { isMainAddress } = dto;
      if (isMainAddress) {
        await this.prisma.userAddress.updateMany({
          where: {
            userId,
          },
          data: {
            isMainAddress: false,
          },
        });
      }
      await this.prisma.userAddress.create({
        data: {
          ...dto,
          userId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateAddess(dto: UpdateAddressRequestDto, userId: string) {
    try {
      const existedAddress = await this.prisma.userAddress.findUnique({
        where: {
          addressId: dto.addressId,
          userId,
        },
      });

      if (!existedAddress) {
        throw new NotFoundException("User's address is not found");
      }
      const { isMainAddress } = dto;
      if (isMainAddress) {
        await this.prisma.userAddress.updateMany({
          where: {
            userId,
          },
          data: {
            isMainAddress: false,
          },
        });
      }
      await this.prisma.userAddress.update({
        data: {
          ...dto,
        },
        where: {
          addressId: dto.addressId,
        },
      });
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

      await this.prisma.userAddress.delete({
        where: {
          addressId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
