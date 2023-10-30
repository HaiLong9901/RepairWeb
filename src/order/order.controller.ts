import {
  Controller,
  UseGuards,
  Query,
  Param,
  Req,
  Get,
  Post,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderReponseDto } from './dto/response.dto';
import { OrderRequestDto } from './dto/request.dto';
import { CustomerGuard } from 'src/auth/guard/customer.guard';

@Controller('order')
@ApiTags('Order')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('getAll')
  @ApiResponse({ type: OrderReponseDto, isArray: true })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'repairmanId', required: false })
  getAllOrder(@Req() req) {
    return this.orderService.getAllOrder(req);
  }

  @Post('createOrder')
  @UseGuards(CustomerGuard)
  @ApiResponse({ type: OrderReponseDto })
  createOrder(dto: OrderRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.orderService.createOrder(dto, userId);
  }

  @Get(':id')
  @ApiResponse({ type: OrderReponseDto })
  getOrderById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.orderService.getOrderById(id, req.user);
  }
}
