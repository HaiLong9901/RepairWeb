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
import { StaffGuard } from 'src/auth/guard/staff.guard';

@Controller('service')
@ApiTags('Service')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Get('getAll')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  getAllService() {
    return this.serviceService.getAllService();
  }

  @Get(':id')
  @ApiResponse({ type: ServiceResponseDto })
  getServiceById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.getServiceById(id);
  }

  @Post('createService')
  @UseGuards(JwtGuard, AdminGuard, StaffGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiResponse({ type: ServiceResponseDto })
  createService(
    @Body() dto: CreateServiceRequestDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (image) {
      const imageUrl = image.buffer.toString('base64');
      dto.image = imageUrl;
    }
    return this.serviceService.createService(dto);
  }

  // @Post('createService')
  // @UseGuards(JwtGuard, AdminGuard)
  // @ApiResponse({ type: ServiceResponseDto })
  // async createService(@Body() dto: CreateServiceRequestDto) {
  //   return this.serviceService.createService(dto);
  // }

  @Patch('updateService')
  @UseGuards(JwtGuard, AdminGuard, StaffGuard)
  @ApiResponse({ type: ServiceResponseDto })
  updateService(@Body() dto: UpdateServiceRequestDto) {
    return this.serviceService.updateService(dto);
  }

  @Patch('delete/:id')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiResponse({ status: 200 })
  toggleServiceActive(@Param('id') sericeId: string) {
    return this.serviceService.toggleServiceActive(parseInt(sericeId));
  }

  @Get('getServiceByName/:keyword')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  getServiceByName(@Param('keyword') keyword: string) {
    return this.serviceService.getServiceByName(keyword);
  }

  @Get('getServiceByType/:type')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  getAllServiceByType(@Param('type', ParseIntPipe) type: number) {
    return this.serviceService.getServiceByType(type);
  }

  @Get('getServiceBySkill/:skillId')
  @ApiResponse({ type: ServiceResponseDto, isArray: true })
  getAllServiceBySkill(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.serviceService.getServiceBySkill(skillId);
  }

  @Post('createMultiServices')
  @UseGuards(JwtGuard, AdminGuard, StaffGuard)
  @ApiResponse({ status: 200 })
  createMultiServices(@Body() dto: CreateServiceRequestDto[]) {
    return this.serviceService.createMultiServices(dto);
  }
}
