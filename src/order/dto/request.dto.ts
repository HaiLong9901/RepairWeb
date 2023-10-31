import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class DetailOrderRequestDto {
  @ApiProperty()
  @IsPositive()
  orderDetailId?: number;

  @ApiProperty()
  @IsPositive()
  orderId?: number;

  @ApiProperty()
  @IsPositive()
  serviceId: number;

  @ApiProperty()
  @IsString()
  desc: string;

  @ApiProperty()
  media: OrderMediaRequestDto[];
}

export class OrderMediaRequestDto {
  @ApiProperty()
  @IsPositive()
  orderMediaId: number;

  @ApiProperty()
  @IsPositive()
  orderDetailId?: number;

  @ApiProperty()
  @IsPositive()
  mediaType: number;

  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  alt?: string;
}

export class OrderRequestDto {
  @ApiProperty()
  @IsPositive()
  orderId: number;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsPositive()
  status: number;

  @ApiProperty()
  @IsString()
  expectDate: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  repairmanId?: string;

  @ApiProperty()
  @IsNumber()
  addressId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  incurredCost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  incurredCostReason: string;

  @ApiProperty()
  orderDetail?: DetailOrderRequestDto[];
}

export class UpdateOrderStatusRequestDto {
  @ApiProperty()
  @IsPositive()
  orderId: number;

  @ApiProperty()
  status: number;
}

export class DiagnosisRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  diagnosisId: number;

  @ApiProperty()
  @IsNumber()
  orderDetailId: number;

  @ApiProperty()
  @IsNumber()
  malfuncId: number;

  @ApiProperty()
  @IsBoolean()
  isAccept: boolean;
}

export class ComponentRequestDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  componentId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsPositive()
  quantity: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsPositive()
  pricePerUnit: number;

  @ApiProperty()
  @IsPositive()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsString()
  supplier: string;

  @ApiProperty()
  @IsPositive()
  orderId: number;
}
