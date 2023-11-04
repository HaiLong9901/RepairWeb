import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Req,
  UseGuards,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CartItemResponseDto, CartResponseDto } from './dto/response.dto';
import { CustomerGuard } from 'src/auth/guard/customer.guard';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CartItemRequestDto } from './dto/request.dto';

@Controller('cart')
@ApiTags('Cart')
@UseGuards(JwtGuard, CustomerGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('createCartItem')
  @ApiResponse({ type: CartItemResponseDto })
  createCartItem(@Body() dto: CartItemRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.cartService.createCartItem(dto, userId);
  }

  @Patch('chooseCartItem/:cartItemId')
  @ApiResponse({ type: CartItemResponseDto })
  chooseCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.cartService.chooseCartItem(cartItemId, userId);
  }

  @Delete('deleteCartItem/:cartItemId')
  @ApiResponse({ status: 200 })
  deleteCartItem(
    @Param('cartItemId', ParseIntPipe) cartItemId: number,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.cartService.deleteCartItem(cartItemId, userId);
  }

  @Get('getCart')
  @ApiResponse({ type: CartResponseDto })
  getCart(@Req() req) {
    const { userId } = req.user;
    return this.cartService.getCart(userId);
  }
}
