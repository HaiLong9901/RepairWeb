import { ApiProperty } from '@nestjs/swagger';

export class OrderDetailReponseDto {
  @ApiProperty()
  orderDetailId?: number;

  @ApiProperty()
  orderId?: number;

  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  desc: string;

  @ApiProperty()
  media: OrderMediaReponseDto[];
}

export class OrderMediaReponseDto {
  @ApiProperty()
  orderMediaId: number;

  @ApiProperty()
  orderDetailId?: number;

  @ApiProperty()
  mediaType: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  alt?: string;
}

export class OrderReponseDto {
  @ApiProperty()
  orderId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  expectDate: string;

  @ApiProperty()
  repairmanId?: string;

  @ApiProperty()
  addressId: number;

  @ApiProperty()
  incurredCost?: number;

  @ApiProperty()
  incurredCostReason: string;

  @ApiProperty()
  orderDetail?: OrderDetailReponseDto[];
}

export class DiagnosisResponseDto {
  @ApiProperty()
  diagnosisId: number;

  @ApiProperty()
  orderDetailId: number;

  @ApiProperty()
  malfuncId: number;

  @ApiProperty()
  isAccept: boolean;
}

export class ComponentResponsetDto {
  @ApiProperty()
  componentId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  pricePerUnit: number;

  @ApiProperty()
  brand: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  supplier: string;

  @ApiProperty()
  orderId: number;
}
