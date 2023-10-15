import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsPositive()
  type: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  @IsString()
  desc: string;

  @ApiProperty()
  @IsPositive()
  skillId: number;
}
