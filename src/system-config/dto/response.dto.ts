import { ApiProperty } from '@nestjs/swagger';

export class SystemConfigResponseDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  assignOrderInterval: number;

  @ApiProperty()
  distanceToAssignOrder: number;

  @ApiProperty()
  switchRepairmanStatusPeriod: number;
}
