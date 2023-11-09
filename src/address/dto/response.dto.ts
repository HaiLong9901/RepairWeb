import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty()
  addressId: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  isMainAddress: boolean;

  @ApiProperty()
  userId: string;
}
