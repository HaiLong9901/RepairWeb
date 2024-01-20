import { ApiProperty } from '@nestjs/swagger';
import {
  Component,
  Diagnosis,
  Service,
  User,
  UserAddress,
} from '@prisma/client';
import { formatBigInt } from 'src/utils/formatResponse';

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

  @ApiProperty()
  diagnosis: Diagnosis[];

  @ApiProperty()
  service: Service;
  public static formatDto = (dto: OrderDetailReponseDto) => {
    return {
      orderDetailId: dto.orderDetailId.toString(),
      orderId: dto.orderId.toString(),
      serviceId: dto.serviceId,
      desc: dto.desc,
      media: dto.media
        ? dto.media.map((val: OrderMediaReponseDto) =>
            OrderMediaReponseDto.formatDto(val),
          )
        : [],
      service: formatBigInt(dto.service),
      diagnosis: dto.diagnosis?.map((dia) =>
        DiagnosisResponseDto.formatDto(dia),
      ),
    };
  };
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

  public static formatDto = (dto: OrderMediaReponseDto) => {
    return {
      orderMediaId: dto.orderMediaId.toString(),
      orderDetailId: dto.orderDetailId.toString(),
      mediaType: dto.mediaType,
      url: dto.url,
      alt: dto.alt,
    };
  };
}

export class OrderReponseDto {
  @ApiProperty()
  orderId: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  expectedDate: string;

  @ApiProperty()
  repairmanId?: string;

  @ApiProperty()
  addressId: number;

  @ApiProperty()
  incurredCost?: number;

  @ApiProperty()
  incurredCostReason: string;

  @ApiProperty()
  orderDetails?: OrderDetailReponseDto[];

  @ApiProperty()
  updatedAt?: string;

  @ApiProperty()
  createdAt?: string;

  @ApiProperty()
  address?: UserAddress;

  @ApiProperty()
  components?: Component;

  @ApiProperty()
  repairman?: User;

  @ApiProperty()
  user?: User;

  public static formatDto = (dto: any) => {
    return {
      orderId: dto.orderId.toString(),
      code: dto.code,
      status: dto.status,
      expectedDate: dto.expectedDate,
      repairmanId: dto.repairmanId,
      addressId: dto.addressId,
      incurredCost: dto.incurredCost,
      incurredCostReason: dto.incurredCostReason,
      orderDetails: dto.orderDetails.map((detail) =>
        OrderDetailReponseDto.formatDto(detail),
      ),
      components: dto.components?.map((component) =>
        ComponentResponsetDto.formatDto(component),
      ),
      updatedAt: dto.updatedAt,
      createdAt: dto.createdAt,
      address: dto.address,
      repairman: dto.repairman,
      user: dto.user,
    };
  };
}

export class DiagnosisResponseDto {
  @ApiProperty()
  diagnosisId: number;

  @ApiProperty()
  orderDetailId: number;

  @ApiProperty()
  malfuncId: number;

  public static formatDto = (dto: Diagnosis) => {
    return {
      diagnosisId: dto.diagnosisId.toString(),
      orderDetailId: dto.orderDetailId.toString(),
      malfuncId: dto.malfuncId.toString(),
    };
  };
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

  public static formatDto = (dto: Component) => {
    return {
      componentId: dto.componentId.toString(),
      name: dto.name,
      quantity: dto.quantity,
      unit: dto.unit,
      pricePerUnit: dto.pricePerUnit,
      brand: dto.brand,
      model: dto.model,
      supplier: dto.supplier,
      orderId: dto.orderId.toString(),
    };
  };
}
