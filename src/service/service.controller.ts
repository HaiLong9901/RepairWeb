import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
  async createService(dto: CreateServiceRequestDto) {
    return this.serviceService.createService(dto);
  }

  @Patch('updateService')
  @ApiResponse({ type: ServiceResponseDto })
  async updateService(dto: UpdateServiceRequestDto) {
    return this.serviceService.updateService(dto);
  }

  //   @Patch('delete/:id')
  //   @ApiResponse({})
}
