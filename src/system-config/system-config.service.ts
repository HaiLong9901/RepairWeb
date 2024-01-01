import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SystemConfigRequestDto } from './dto/request.dto';
import { OrderService } from 'src/order/order.service';
@Injectable()
export class SystemConfigService {
  constructor(
    private prisma: PrismaService,
    private orderService: OrderService,
  ) {}

  async getAllConfig() {
    try {
      const configs = await this.prisma.systemConfig.findMany();
      return Array.isArray(configs) && configs[0];
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

      // OrderService.intervalDur = dto.assignOrderInterval * 60000;
      this.orderService.updateInterval(dto.assignOrderInterval * 60000);

      return updatedConfig;
    } catch (error) {
      throw error;
    }
  }
}
