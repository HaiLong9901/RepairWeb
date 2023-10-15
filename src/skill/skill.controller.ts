import { Controller, Get } from '@nestjs/common';
import { SkillService } from './skill.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillResponseDto } from './dto/response.dto';

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
}
