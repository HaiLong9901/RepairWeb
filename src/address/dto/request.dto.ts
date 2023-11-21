import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class AddressRequestDto {
  @ApiProperty()
  @IsPositive()
  @IsOptional()
  addressId: number;

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

  @ApiProperty()
  @IsString()
  userId: string;
}
