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
      return formatBigInt(service);
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
      console.log({ existedService });
      if (!existedService) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }
      const service = await this.prisma.service.update({
        data: {
          name: dto.name,
          image: dto.image,
          price: dto.price,
          type: dto.type,
          rate: dto.rate,
          desc: dto.desc,
        },
        where: {
          serviceId: dto.serviceId,
        },
      });

      return formatBigInt(service);
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
        orderBy: {
          createdAt: 'desc',
        },
      });

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
        },
        include: {
          malfunctions: true,
          skill: true,
        },
      });

      if (!service) {
        throw new NotFoundException('Service is not found');
      }

      return formatBigInt(service);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async toggleServiceActive(serviceId: number) {
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
          isActive: existedService.isActive ? false : true,
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
        },
        include: {
          skill: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return services.map((value) => {
        return formatBigInt(value);
      });
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
        },
        include: {
          skill: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return services.map((value) => {
        return formatBigInt(value);
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getServiceBySkill(skillId: number) {
    try {
      const existedSkill = await this.prisma.skill.findUnique({
        where: {
          skillId,
        },
      });
      if (!existedSkill) {
        throw new NotFoundException('Skill is not found');
      }
      const services = await this.prisma.service.findMany({
        where: {
          skillId: skillId,
        },
        include: {
          skill: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return services.map((value) => formatBigInt(value));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
