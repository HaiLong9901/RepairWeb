import { ApiProperty } from '@nestjs/swagger';

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
  skill: string;

  @ApiProperty()
  skillId: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
