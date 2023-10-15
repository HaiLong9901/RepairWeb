import { Controller, Get, Patch, Post } from '@nestjs/common';
import { SkillService } from './skill.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillResponseDto } from './dto/response.dto';
import {
  CreateSkillRequestDto,
  UpdateSkillRequestDto,
} from './dto/request.dto';

@Controller('skill')
@ApiTags('Skill')
export class SkillController {
  constructor(private skillService: SkillService) {}

  @Get('getAll')
  @ApiResponse({ type: [SkillResponseDto], isArray: true, status: 200 })
  async getAllSkill() {
    return this.skillService.getAllSkill();
  }

  @Get(':id')
  @ApiResponse({ type: SkillResponseDto })
  async getSkillById() {
    return this.skillService.getSkillById(1);
  }

  @Post('createSkill')
  @ApiResponse({ type: SkillResponseDto })
  async createSkill(dto: CreateSkillRequestDto) {
    return this.skillService.createSkill(dto);
  }

  @Patch('updateSkill')
  @ApiResponse({ type: SkillResponseDto })
  async updateSkill(dto: UpdateSkillRequestDto) {
    return this.skillService.updateSkill(dto);
  }
}
