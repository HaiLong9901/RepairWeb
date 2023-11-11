import { ApiProperty } from '@nestjs/swagger';

export class SkillResponseDto {
  @ApiProperty()
  skillId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isActive: boolean;
}
