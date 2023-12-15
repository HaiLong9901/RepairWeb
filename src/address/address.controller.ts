import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AddressResponseDto } from './dto/response.dto';
import { AddressRequestDto } from './dto/request.dto';

@Controller('address')
@ApiTags('User Address')
@UseGuards(JwtGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('createAddress')
  @ApiResponse({ type: AddressResponseDto })
  createAddress(@Body() dto: AddressRequestDto, @Req() req) {
    const user = req.user;
    return this.addressService.createAdress(dto, user);
  }

  @Patch('updateAddress')
  @ApiResponse({ type: AddressRequestDto })
  updateAddress(@Body() dto: AddressRequestDto, @Req() req) {
    const user = req.user;
    return this.addressService.updateAddess(dto, user);
  }

  @Patch('deleteAddress/:addressId')
  @ApiResponse({ status: 204 })
  @HttpCode(204)
  deleteAddress(
    @Param('addressId', ParseIntPipe) addressId: number,
    @Req() req,
  ) {
    const { userId } = req.user;
    return this.addressService.deleteAddress(addressId, userId);
  }

  @Get('getAllAddress/:userId')
  @ApiResponse({ type: AddressResponseDto, isArray: true })
  getAllAdress(@Param('userId') userId: string, @Req() req) {
    const user = req.user;
    return this.addressService.getAllUserAddress(userId, user);
  }
}
