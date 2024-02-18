import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class MalfunctionRequestDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  malfuncId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsPositive()
  serviceId: number;

  @ApiProperty()
  @IsOptional()
  isActive?: boolean;
}
