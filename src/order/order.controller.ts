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
  Body,
  NotFoundException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ComponentResponsetDto,
  DiagnosisResponseDto,
  OrderReponseDto,
} from './dto/response.dto';
import {
  CancelOrderRequestDto,
  ComponentRequestDto,
  DiagnosisRequestDto,
  OrderRequestDto,
} from './dto/request.dto';
import { CustomerGuard } from 'src/auth/guard/customer.guard';
import { RepairmanGuard } from 'src/auth/guard/repairman.guard';
import { StaffGuard } from 'src/auth/guard/staff.guard';

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
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAllOrders(@Query() query) {
    return this.orderService.getAllOrder(query);
  }
  @Get('getAllByUserId/:id')
  @ApiResponse({ type: OrderReponseDto, isArray: true })
  @ApiQuery({ name: 'status', required: false })
  getAllOrdersByUserId(
    @Req() req,
    @Query() query,
    @Param('id') userId: string,
  ) {
    return this.orderService.getOrdersByUserId(req.user, query, userId);
  }

  @Post('createOrder')
  @UseGuards(CustomerGuard)
  @ApiResponse({ type: OrderReponseDto })
  createOrder(@Body() dto: OrderRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.orderService.createOrder(dto, userId);
  }

  @Get(':id')
  @ApiResponse({ type: OrderReponseDto })
  getOrderById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.orderService.getOrderById(id, req.user);
  }

  @Post('createDiagnosis')
  @ApiResponse({ type: DiagnosisResponseDto })
  @UseGuards(RepairmanGuard)
  createDiagnosis(@Body() dto: DiagnosisRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.orderService.createDiagnosis(dto, userId);
  }

  @Post('createComponent')
  @ApiResponse({ type: ComponentResponsetDto })
  @UseGuards(RepairmanGuard)
  createComponent(@Body() dto: ComponentRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.orderService.createComponent(dto, userId);
  }

  @Patch('confirmDiagnosis/:diagnosisId')
  @ApiResponse({ status: 204 })
  @UseGuards(CustomerGuard)
  confirmDiagnosis(
    @Param('diagnosisId', ParseIntPipe) diagnosisId: number,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.orderService.toggleAcceptDiagnosis(diagnosisId, userId);
  }

  @Patch('cancelOrder')
  @ApiResponse({ status: 204 })
  @UseGuards(CustomerGuard, StaffGuard)
  cancelOrder(@Req() req, dto: CancelOrderRequestDto) {
    const user = req.user;
    return this.orderService.cancelOrder(user, dto);
  }

  @Get('generateQrInfo/:orderId')
  @ApiResponse({ type: String })
  @UseGuards(CustomerGuard)
  generateQrInfo(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() req: any,
  ) {
    const { userId } = req.user;
    return this.orderService.generateQrInfo(orderId, userId);
  }

  @Patch('assignOrder')
  @ApiResponse({ status: 204 })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'repairmanId', required: true })
  assignOrder(@Query() query) {
    const { orderId, repairmanId } = query;
    const convertedOrderId = parseInt(orderId);
    if (!orderId) throw new NotFoundException('OrderId is not valid');
    return this.orderService.assignOrder(convertedOrderId, repairmanId);
  }
}
