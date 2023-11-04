import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateSkillRequestDto,
  UpdateSkillRequestDto,
} from './dto/request.dto';

@Injectable()
export class SkillService {
  constructor(private prisma: PrismaService) {}

  async createSkill(dto: CreateSkillRequestDto) {
    try {
      const skill = await this.prisma.skill.create({
        data: {
          name: dto.name,
          isActive: true,
        },
      });

      return skill;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateSkill(dto: UpdateSkillRequestDto) {
    try {
      const existedSkill = await this.prisma.skill.findUnique({
        where: {
          skillId: dto.skillId,
        },
      });

      if (!existedSkill) {
        throw new NotFoundException('Kỹ năng không tồn tại');
      }

      const updateSkill = await this.prisma.skill.update({
        data: {
          name: dto.name,
        },
        where: {
          skillId: dto.skillId,
        },
      });

      return updateSkill;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllSkill() {
    try {
      const skills = await this.prisma.skill.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return skills;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getSkillById(skillId: number) {
    try {
      const skill = await this.prisma.skill.findUnique({
        where: {
          skillId,
        },
      });

      if (!skill) {
        throw new NotFoundException('Kỹ năng không tồn tại');
      }
      return skill;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async toggleSkillActive(skillId: number) {
    try {
      const existedSkill = await this.prisma.skill.findUnique({
        where: {
          skillId,
        },
      });

      if (!existedSkill) {
        return new ForbiddenException('Skill is not found');
      }

      await this.prisma.skill.update({
        where: {
          skillId,
        },
        data: {
          isActive: existedSkill.isActive ? false : true,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
