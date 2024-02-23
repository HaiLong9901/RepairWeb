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
import { DiagnosisResponseDto, OrderReponseDto } from './dto/response.dto';
import {
  CancelOrderRequestDto,
  ComponentRequestDto,
  DiagnosisRequestDto,
  OrderRequestDto,
  UpdateIncurredCost,
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

  @Post('createDiagnosises')
  @ApiResponse({ type: DiagnosisResponseDto })
  @UseGuards(RepairmanGuard)
  createDiagnosises(@Body() dto: DiagnosisRequestDto[], @Req() req) {
    const { userId } = req.user;
    return this.orderService.createDiagnosises(dto, userId);
  }

  @Post('createComponents')
  @ApiResponse({ status: 200 })
  @UseGuards(RepairmanGuard)
  createComponents(@Body() dto: ComponentRequestDto[], @Req() req) {
    const { userId } = req.user;
    return this.orderService.createComponents(dto, userId);
  }

  @Patch('updateIncurCost')
  @ApiResponse({ type: OrderReponseDto })
  @UseGuards(RepairmanGuard)
  updateIncurCost(@Body() dto: UpdateIncurredCost, @Req() req) {
    const { userId } = req.user;
    return this.orderService.updateIncurCost(dto, userId);
  }

  @Patch('cancelOrder')
  @ApiResponse({ status: 204 })
  // @UseGuards(CustomerGuard)
  cancelOrder(@Req() req, @Body() dto: CancelOrderRequestDto) {
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
  @UseGuards(StaffGuard)
  @ApiResponse({ status: 204 })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'repairmanId', required: true })
  assignOrder(@Query() query) {
    const { orderId, repairmanId } = query;
    const convertedOrderId = parseInt(orderId);
    if (!orderId) throw new NotFoundException('OrderId is not valid');
    return this.orderService.assignOrder(convertedOrderId, repairmanId);
  }

  @Post('/createMultiOrder')
  @UseGuards(StaffGuard)
  @ApiResponse({ status: 204 })
  createMultiOrders(@Body() dto: OrderRequestDto[]) {
    return this.orderService.createMultiOrders(dto);
  }

  @Post('/statistic')
  @UseGuards(StaffGuard)
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'type', required: true })
  getStatistic(@Query() query: any) {
    return this.orderService.getStatistic(query);
  }

  @Patch('/updateOrderStatusByRepairman/:orderId/:status')
  @UseGuards(RepairmanGuard)
  @ApiResponse({ status: 204 })
  updateStatusByRepairman(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('status', ParseIntPipe) status: number,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.orderService.updateOrderStatusByRepairman(
      orderId,
      status,
      userId,
    );
  }

  @Get('/checkInQr/:code')
  @UseGuards(RepairmanGuard)
  @ApiResponse({ status: 204 })
  checkinQr(@Param('code') code: string, @Req() req) {
    const { userId } = req.user;
    return this.orderService.checkInOrder(userId, code);
  }

  @Post('/dailyStatistic')
  @UseGuards(StaffGuard)
  getDailyStatistic() {
    return this.orderService.getDailyStatistic();
  }
}
