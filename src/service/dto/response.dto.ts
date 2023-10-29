import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  desc: string;

  @ApiProperty()
  skill: Skill;

  @ApiProperty()
  skillId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  image: string;
}
