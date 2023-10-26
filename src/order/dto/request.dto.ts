import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString } from 'class-validator';

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
  userId?: string;

  @ApiProperty()
  @IsString()
  repairmanId?: string;

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
