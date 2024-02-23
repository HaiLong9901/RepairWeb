import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@prisma/client';

export class MalfunctionResponseDto {
  @ApiProperty()
  malfuncId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  service: Service;

  @ApiProperty()
  isActive: boolean;

  public static formatDto(dto: any) {
    return {
      name: dto?.name,
      price: dto?.price.toString(),
      serviceId: dto?.serviceId,
      isActive: dto?.isActive,
    };
  }
}
