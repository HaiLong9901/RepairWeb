import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsPositive()
  type: number;

  @ApiProperty()
  @IsPositive()
  price: number;

  @ApiProperty()
  @IsString()
  desc: string;

  @ApiProperty()
  @IsPositive()
  skillId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;
}
export class UpdateServiceRequestDto {
  @ApiProperty()
  @IsPositive()
  serviceId: number;

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

  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;
}
