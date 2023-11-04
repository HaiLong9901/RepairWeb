import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CartItemRequestDto {
  @ApiProperty()
  @IsPositive()
  @IsOptional()
  id: number;

  @ApiProperty()
  @IsBoolean()
  isChoosen: boolean;

  @ApiProperty()
  @IsNumber()
  serviceId: number;

  @ApiProperty()
  @IsNumber()
  cartId: number;
}
