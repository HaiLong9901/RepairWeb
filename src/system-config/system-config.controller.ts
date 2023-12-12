import { Controller, Get } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('system-config')
@ApiTags('SystemConfig')
export class SystemConfigController {
  constructor(private systemConfigService: SystemConfigService) {}
  @Get('/getAll')
  getAllSystemConfig() {
    return this.systemConfigService.getConfig();
  }
}
