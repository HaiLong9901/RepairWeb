import { Module } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { SystemConfigController } from './system-config.controller';
import { OrderModule } from 'src/order/order.module';

@Module({
  providers: [SystemConfigService],
  controllers: [SystemConfigController],
  imports: [OrderModule],
})
export class SystemConfigModule {}
