import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './system-config.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemConfigResponseDto } from './dto/response.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { StaffGuard } from 'src/auth/guard/staff.guard';
import { SystemConfigRequestDto } from './dto/request.dto';

@Controller('system-config')
@ApiTags('SystemConfig')
@UseGuards(JwtGuard)
export class SystemConfigController {
  constructor(private systemConfigService: SystemConfigService) {}

  @Get('/getAll')
  @UseGuards(StaffGuard)
  @ApiResponse({ type: SystemConfigResponseDto, isArray: true })
  getAllSystemConfig() {
    return this.systemConfigService.getAllConfig();
  }

  @Patch('/update')
  @UseGuards(StaffGuard)
  @ApiResponse({ type: SystemConfigResponseDto })
  updateSystemConfig(@Body() dto: SystemConfigRequestDto) {
    return this.systemConfigService.updateConfig(dto);
  }
}
