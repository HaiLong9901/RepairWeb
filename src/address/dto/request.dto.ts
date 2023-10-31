import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateAddressRequestDto {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  longitude: number;

  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMainAddress: boolean;
}

export class UpdateAddressRequestDto {
  @ApiProperty()
  @IsPositive()
  addressId: number;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  coordinate: string;

  @ApiProperty()
  @IsBoolean()
  isMainAddress: boolean;
}
