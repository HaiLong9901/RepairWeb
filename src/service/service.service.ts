import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from './dto/request.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createService(dto: CreateServiceRequestDto) {
    try {
      const service = await this.prisma.service.create({
        data: {
          ...dto,
        },
      });

      return service;
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

  //   async deleteService(serviceId: number) {
  //     try {
  //       const checkExistedService = await this.prisma.service.findUnique({
  //         where: {
  //           serviceId,
  //           isActive: true,
  //         },
  //       });

  //       if (!checkExistedService) {
  //         throw new NotFoundException('Dịch vụ không tồn tại');
  //       }

  //       const updatedService = await this.prisma.service.update({
  //         data: {
  //           isActive: false,
  //         },
  //         where: {
  //           serviceId,
  //         },
  //       });

  //       return updatedService;
  //     } catch (error) {}
  //   }

  async getAllService() {
    try {
      const services = await this.prisma.service.findMany();

      return services;
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
        },
      });

      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }

      return service;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  //   async getServiceByName(name: string) {}

  //   async getServiceByType(type: number) {}

  //   async getServiceBySkill(skillId: number) {}
}
