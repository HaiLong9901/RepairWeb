import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@prisma/client';

export class MalfunctionResponseDto {
  @ApiProperty()
  malFuncId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  service: Service;
}
