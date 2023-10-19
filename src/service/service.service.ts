import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from './dto/request.dto';
import { formatBigInt } from 'src/utils/formatResponse';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createService(dto: CreateServiceRequestDto) {
    console.log({ dto });
    try {
      const existedSkill = await this.prisma.skill.findUnique({
        where: {
          skillId: dto.skillId,
        },
      });
      if (!existedSkill) throw new NotFoundException('Skill does not exist');
      const service = await this.prisma.service.create({
        data: {
          ...dto,
        },
      });
      const result: any = { ...service };
      result.price = service.price.toString();
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateService(dto: UpdateServiceRequestDto) {
    try {
      const existedService = await this.prisma.service.findUnique({
        where: {
          serviceId: dto.serviceId,
        },
      });

      if (!existedService) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }
      delete dto.serviceId;
      const service = await this.prisma.service.update({
        data: {
          ...dto,
        },
        where: {
          serviceId: existedService.serviceId,
        },
      });

      return service;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllService() {
    try {
      const services = await this.prisma.service.findMany({
        include: {
          skill: true,
        },
        where: {
          isActive: true,
        },
      });

      // return services;
      return services.map((value) => {
        return formatBigInt(value);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getServiceById(serviceId: number) {
    try {
      const service = await this.prisma.service.findUnique({
        where: {
          serviceId,
          isActive: true,
        },
      });

      if (!service) {
        throw new NotFoundException('Service is not found');
      }

      return service;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteService(serviceId: number) {
    try {
      const existedService = await this.prisma.service.findUnique({
        where: {
          serviceId,
        },
      });
      if (!existedService) {
        throw new NotFoundException('Service is not found');
      }
      await this.prisma.service.update({
        data: {
          isActive: false,
        },
        where: {
          serviceId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getServiceByName(keyword: string) {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          OR: [
            {
              name: {
                contains: keyword,
              },
            },
          ],
          isActive: true,
        },
      });

      if (!services || services.length === 0) {
        throw new NotFoundException('No service found');
      }

      return services;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getServiceByType(type: number) {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          type: type,
          isActive: true,
        },
      });

      if (!services || services.length === 0) {
        throw new NotFoundException('No service found');
      }

      return services;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getServiceBySkill(skillId: number) {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          skillId: skillId,
          isActive: true,
        },
      });

      if (!services || services.length === 0) {
        throw new NotFoundException('No service found');
      }

      return services;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
