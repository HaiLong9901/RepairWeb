import { Controller, Get, Param, Patch, Post, Body } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServiceResponseDto } from './dto/response.dto';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestDto,
} from './dto/request.dto';

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
  async getServiceById(@Param('id') id: number) {
    return this.serviceService.getServiceById(id);
  }

  @Post('createService')
  @ApiResponse({ type: ServiceResponseDto })
  async createService(@Body() dto: CreateServiceRequestDto) {
    return this.serviceService.createService(dto);
  }

  @Patch('updateService')
  @ApiResponse({ type: ServiceResponseDto })
  async updateService(@Body() dto: UpdateServiceRequestDto) {
    return this.serviceService.updateService(dto);
  }

  @Patch('delete/:id')
  @ApiResponse({ status: 200 })
  async deleteService(@Param('id') sericeId: string) {
    return this.serviceService.deleteService(parseInt(sericeId));
  }

  @Get('getServiceByName/:keyword')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getServiceByName(@Param('keyword') keyword: string) {
    return this.serviceService.getServiceByName(keyword);
  }

  @Get('getServiceByType/:type')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getAllServiceByType(@Param('type') type: number) {
    return this.serviceService.getServiceByType(type);
  }

  @Get('getServiceBySkill/:skillId')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  async getAllServiceBySkill(@Param('skillId') skillId: number) {
    return this.serviceService.getServiceBySkill(skillId);
  }
}
