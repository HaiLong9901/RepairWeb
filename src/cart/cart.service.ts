import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItemRequestDto } from './dto/request.dto';
import { CartItemResponseDto, CartResponseDto } from './dto/response.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart(userId: string) {
    try {
      const existedCart = await this.prisma.cart.findUnique({
        where: {
          userId,
        },
      });

      if (existedCart) {
        throw new ForbiddenException('Cart for user already existed');
      }

      await this.prisma.cart.create({
        data: {
          userId,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createCartItem(dto: CartItemRequestDto, userId: string) {
    try {
      const existedCart = await this.prisma.cart.findUnique({
        where: {
          cartId: dto.cartId,
        },
      });

      if (userId !== existedCart.userId) {
        return new ForbiddenException(
          'You are not permitted to change this data',
        );
      }

      if (!existedCart) {
        throw new NotFoundException('Cart is not found');
      }

      const cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: dto.cartId,
          serviceId: dto.serviceId,
          isChoosen: false,
        },
        include: {
          service: true,
        },
      });

      return CartItemResponseDto.formatDto(cartItem, cartItem.service);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async chooseCartItem(cartItemId: number, userId: string) {
    try {
      const existedCartItemId = await this.prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
        include: {
          cart: true,
        },
      });

      if (!existedCartItemId) {
        return new NotFoundException('Cart item is not found');
      }

      if (userId !== existedCartItemId.cart.userId) {
        return new ForbiddenException(
          'You are not permitted to change this data',
        );
      }

      const updatedCartItem = await this.prisma.cartItem.update({
        where: {
          id: cartItemId,
        },
        data: {
          isChoosen: existedCartItemId.isChoosen ? false : true,
        },
      });

      return updatedCartItem;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteCartItem(cartItemId, userId) {
    try {
      const existedCartItemId = await this.prisma.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
        include: {
          cart: true,
        },
      });

      if (!existedCartItemId) {
        return new NotFoundException('Cart item is not found');
      }

      if (userId !== existedCartItemId.cart.userId) {
        return new ForbiddenException(
          'You are not permitted to change this data',
        );
      }

      await this.prisma.cartItem.delete({
        where: {
          id: cartItemId,
        },
      });

      return {
        message: 'Delete Cart item successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCart(userId: string) {
    try {
      const cart = await this.prisma.cart.findUnique({
        where: {
          userId,
        },
        include: {
          cartItems: {
            include: {
              service: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return CartResponseDto.formatDto(cart);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
