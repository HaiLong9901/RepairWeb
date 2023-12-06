import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { MalfunctionService } from './malfunction.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { MalfunctionResponseDto } from './dto/response.dto';
import { MalfunctionRequestDto } from './dto/request.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { StaffGuard } from 'src/auth/guard/staff.guard';

@Controller('malfunction')
@ApiTags('Malfunction')
export class MalfunctionController {
  constructor(private malfunctionService: MalfunctionService) {}

  @Get('getAll')
  @ApiResponse({ type: MalfunctionResponseDto, isArray: true })
  getAllMalfunction() {
    return this.malfunctionService.getAllMalfunction();
  }

  @Get('getByService/:serviceId')
  @ApiResponse({ type: MalfunctionResponseDto, isArray: true })
  getAllMalfunctionByServiceId(
    @Param('serviceId', ParseIntPipe) serviceId: number,
  ) {
    return this.malfunctionService.getAllMalfunctionByServiceId(serviceId);
  }

  @Post('createMalfunction')
  @ApiResponse({ type: MalfunctionResponseDto })
  @UseGuards(JwtGuard, StaffGuard)
  createMalfunction(@Body() dto: MalfunctionRequestDto) {
    return this.malfunctionService.createMalfunction(dto);
  }

  @Patch('updateMalfunction')
  @ApiResponse({ type: MalfunctionResponseDto })
  @UseGuards(JwtGuard, StaffGuard)
  updateMalfunction(dto: MalfunctionRequestDto) {
    return this.malfunctionService.updateMalfunction(dto);
  }

  @Post('createMultiMalfunction')
  @ApiResponse({ status: 200 })
  @UseGuards(JwtGuard, StaffGuard)
  createMultiMalfunction(@Body() dto: MalfunctionRequestDto[]) {
    return this.malfunctionService.createMultiMalfunction(dto);
  }
}
