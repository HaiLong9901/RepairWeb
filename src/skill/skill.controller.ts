import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillResponseDto } from './dto/response.dto';
import {
  CreateSkillRequestDto,
  UpdateSkillRequestDto,
} from './dto/request.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { StaffGuard } from 'src/auth/guard/staff.guard';

@Controller('skill')
@ApiTags('Skill')
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get('getAll')
  @ApiResponse({ type: SkillResponseDto, isArray: true, status: 200 })
  getAllSkill() {
    return this.skillService.getAllSkill();
  }

  @Get(':id')
  @ApiResponse({ type: SkillResponseDto })
  getSkillById(@Param('id', ParseIntPipe) id: number) {
    return this.skillService.getSkillById(id);
  }

  @Post('createSkill')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ type: SkillResponseDto })
  createSkill(@Body() dto: CreateSkillRequestDto) {
    return this.skillService.createSkill(dto);
  }

  @Patch('updateSkill')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ type: SkillResponseDto })
  updateSkill(@Body() dto: UpdateSkillRequestDto) {
    return this.skillService.updateSkill(dto);
  }

  @Patch('toggleSkillActive/:skillId')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ status: 204 })
  toggleSkillActive(@Param('skillId', ParseIntPipe) skillId: number) {
    return this.skillService.toggleSkillActive(skillId);
  }

  @Post('createMultiSkills')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ status: 204 })
  createMultiSkills(@Body() dto: CreateSkillRequestDto[]) {
    return this.skillService.createMultiSkills(dto);
  }

  @Post('updateRepairmanSkill')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ status: 204 })
  updateRepairmanSkill(
    @Body() dto: { repairmanId: string; skillIdList: number[] }[],
  ) {
    return this.skillService.updateRepairmanSkill(dto);
  }
}
