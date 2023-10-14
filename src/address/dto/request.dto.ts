import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class AddressRequestDto {
  @ApiProperty()
  @IsString()
  adress: string;

  @ApiProperty()
  @IsString()
  coordinate: string;

  @ApiProperty()
  @IsBoolean()
  isMainAddress;

  @ApiProperty()
  @IsString()
  userId;
}
