import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Body,
  Patch,
  Req,
  HttpCode,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwitchUserStatusResponseDto, UserResponseDto } from './dto/response';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import {
  ChangePasswordDto,
  CreateUserReqestDto,
  SelfUpdateUserDto,
  UpdateUserRequestDto,
} from './dto/request';
import { PrismaService } from 'src/prisma/prisma.service';
import { RepairmanGuard } from 'src/auth/guard/repairman.guard';
import {
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from 'src/address/dto/request.dto';
import { AddressService } from 'src/address/address.service';
import { CustomerGuard } from 'src/auth/guard/customer.guard';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private addressService: AddressService,
  ) {}

  @Get('getAll')
  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiResponse({ type: UserResponseDto, isArray: true })
  getUsers(@Query() query) {
    return this.userService.getAllUser(query);
  }

  @Get(':id')
  @ApiResponse({ type: UserResponseDto })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('createUser')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: UserResponseDto })
  createUser(@Body() dto: CreateUserReqestDto) {
    return this.userService.createUser(dto);
  }

  @Patch('updateUser')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: UserResponseDto })
  updateUser(@Body() dto: UpdateUserRequestDto) {
    return this.userService.updateUser(dto);
  }

  @Patch('switchUserActiveStatus')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  switchUserActiveStatus(@Body() status: number, @Body() userId: string) {
    return this.userService.switchUserActiveStatus(userId, status);
  }

  @Patch('updateRepairmanStatus')
  @UseGuards(RepairmanGuard)
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  updateRepairmanStatus(@Body() status: number, @Req() req) {
    const { userId } = req.user;
    return this.userService.updateRepairmanStatus(userId, status);
  }

  @Patch('changePassword')
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    const { userId } = req.user;
    return this.userService.changePassword(userId, dto);
  }

  @Patch('updateProfile')
  @ApiResponse({ type: UserResponseDto })
  selfUpdateProfile(@Body() dto: SelfUpdateUserDto, @Req() req) {
    const { userId } = req.user;
    return this.userService.selfUpdateProfile(userId, dto);
  }

  @Post('addAddress')
  @UseGuards(CustomerGuard)
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  addUserAddress(dto: CreateAddressRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.addressService.createAdress(dto, userId);
  }

  @Patch('updateAddress')
  @UseGuards(CustomerGuard)
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  updateUserAddress(dto: UpdateAddressRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.addressService.updateAddess(dto, userId);
  }

  @Delete('deleteAddress/:id')
  @UseGuards(CustomerGuard)
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  deleteUserAddress(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const { userId } = req.user;
    return this.addressService.deleteAddress(id, userId);
  }
}
