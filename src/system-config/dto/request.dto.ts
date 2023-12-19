import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class SystemConfigRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty()
  @IsPositive()
  assignOrderInterval: number;

  @ApiProperty()
  @IsPositive()
  distanceToAssignOrder: number;

  @ApiProperty()
  @IsPositive()
  switchRepairmanStatusPeriod: number;
}
