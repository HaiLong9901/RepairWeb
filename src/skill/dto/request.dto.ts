import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateSkillRequestDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class UpdateSkillRequestDto {
  @ApiProperty()
  @IsNumber()
  skillId: number;

  @ApiProperty()
  @IsString()
  name: string;
}
