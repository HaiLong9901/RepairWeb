import { ApiProperty } from '@nestjs/swagger';
import { CartItem, Service } from '@prisma/client';

export class CartItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  isChoosen: string;

  @ApiProperty()
  cartId: string;

  @ApiProperty()
  service?: any;

  public static formatDto(cartItem: CartItem, service: Service) {
    const result: CartItemResponseDto = {
      id: cartItem.id.toString(),
      isChoosen: cartItem.isChoosen.toString(),
      cartId: cartItem.cartId.toString(),
      service: {
        serviceId: service.serviceId,
        name: service.name,
        price: service.price.toString(),
      },
    };

    return result;
  }
}

export class CartResponseDto {
  @ApiProperty()
  cartId: string;

  @ApiProperty()
  cartItems: CartItemResponseDto[];

  @ApiProperty()
  updatedAt: string;

  public static formatDto(cart: any) {
    const result: CartResponseDto = {
      cartId: cart.cartId,
      cartItems: cart.cartItems.map((val: any) => {
        return CartItemResponseDto.formatDto(val, val.service);
      }),
      updatedAt: cart.updatedAt,
    };

    return result;
  }
}
