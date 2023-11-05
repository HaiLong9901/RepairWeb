import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceResponseDto } from './dto/response.dto';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from './dto/request.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('service')
@ApiTags('Service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Get('getAll')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getAllService() {
    return this.serviceService.getAllService();
  }

  @Get(':id')
  @ApiResponse({ type: ServiceResponseDto })
  async getServiceById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.getServiceById(id);
  }

  @Post('createService')
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ type: ServiceResponseDto })
  async createService(
    @Body() dto: CreateServiceRequestDto,
    @UploadedFile() image,
  ) {
    const imageUrl = image.buffer.toString('base64');
    dto.image = imageUrl;
    return this.serviceService.createService(dto);
  }

  @Patch('updateService')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiResponse({ type: ServiceResponseDto })
  async updateService(@Body() dto: UpdateServiceRequestDto) {
    return this.serviceService.updateService(dto);
  }

  @Patch('delete/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiResponse({ status: 200 })
  async toggleServiceActive(@Param('id') sericeId: string) {
    return this.serviceService.toggleServiceActive(parseInt(sericeId));
  }

  @Get('getServiceByName/:keyword')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getServiceByName(@Param('keyword') keyword: string) {
    return this.serviceService.getServiceByName(keyword);
  }

  @Get('getServiceByType/:type')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getAllServiceByType(@Param('type', ParseIntPipe) type: number) {
    return this.serviceService.getServiceByType(type);
  }

  @Get('getServiceBySkill/:skillId')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getAllServiceBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.serviceService.getServiceBySkill(skillId);
  }
}
