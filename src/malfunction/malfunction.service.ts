import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MalfunctionRequestDto } from './dto/request.dto';
import { formatBigInt } from 'src/utils/formatResponse';

@Injectable()
export class MalfunctionService {
  constructor(private prisma: PrismaService) {}

  async createMalfunction(dto: MalfunctionRequestDto) {
    try {
      const existedService = await this.prisma.service.findUnique({
        where: {
          serviceId: dto.serviceId,
        },
      });
      if (!existedService) {
        throw new NotFoundException('Service is not found');
      }
      const malfunction = await this.prisma.malfunctionCategory.create({
        data: {
          name: dto.name,
          price: dto.price,
          serviceId: dto.serviceId,
        },
      });

      return formatBigInt(malfunction);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateMalfunction(dto: MalfunctionRequestDto) {
    try {
      const existedMalfunction =
        await this.prisma.malfunctionCategory.findUnique({
          where: {
            malfuncId: dto.malfuncId,
          },
        });

      if (!existedMalfunction) {
        throw new NotFoundException('Malfunction category is not found');
      }

      const updatedMalfunction = await this.prisma.malfunctionCategory.update({
        data: {
          name: dto.name,
          price: dto.price,
          serviceId: dto.serviceId,
        },
        where: {
          malfuncId: dto.malfuncId,
        },
      });

      return formatBigInt(updatedMalfunction);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllMalfunction() {
    try {
      const malfunctions = await this.prisma.malfunctionCategory.findMany();

      if (malfunctions.length === 0) return malfunctions;
      return malfunctions.map((value) => formatBigInt(value));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllMalfunctionByServiceId(serviceId: number) {
    try {
      const existedService = this.prisma.service.findUnique({
        where: {
          serviceId,
        },
      });

      if (!existedService) {
        throw new NotFoundException('Service is not found');
      }

      const malfunctions = await this.prisma.malfunctionCategory.findMany({
        where: {
          serviceId,
        },
      });

      if (malfunctions.length === 0) return malfunctions;
      return malfunctions.map((value) => formatBigInt(value));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createMultiMalfunction(dto: MalfunctionRequestDto[]) {
    try {
      await this.prisma.malfunctionCategory.createMany({
        data: dto,
      });
      return {
        message: 'success',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
