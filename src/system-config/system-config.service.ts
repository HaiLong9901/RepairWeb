import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SystemConfigRequestDto } from './dto/request.dto';
@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

  async getAllConfig() {
    try {
      const configs = await this.prisma.systemConfig.findMany();
      return configs;
    } catch (error) {
      throw error;
    }
  }

  async updateConfig(dto: SystemConfigRequestDto) {
    try {
      const updatedConfig = await this.prisma.systemConfig.update({
        where: {
          id: dto.id,
        },
        data: {
          switchRepairmanStatusPeriod: dto.switchRepairmanStatusPeriod,
          distanceToAssignOrder: dto.distanceToAssignOrder,
          assignOrderInterval: dto.assignOrderInterval,
        },
      });

      return updatedConfig;
    } catch (error) {
      throw error;
    }
  }
}
