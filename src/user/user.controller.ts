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
import { RepairmanGuard } from 'src/auth/guard/repairman.guard';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

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

  @Patch('switchUserActiveStatus/:userId')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  switchUserActiveStatus(@Param('userId') userId: string, @Req() req) {
    const user = req.user;
    return this.userService.switchUserActiveStatus(userId, user);
  }

  @Patch('updateRepairmanStatus')
  @UseGuards(RepairmanGuard)
  @ApiResponse({ type: UserResponseDto })
  updateRepairmanStatus(@Body() status: number, @Req() req) {
    const { userId } = req.user;
    return this.userService.updateRepairmanStatus(userId, status);
  }

  @Patch('changePassword')
  @UseGuards(JwtGuard)
  @ApiResponse({ type: UserResponseDto })
  changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    console.log(req.user);
    const { userId } = req.user;
    return this.userService.changePassword(userId, dto);
  }

  @Patch('updateProfile')
  @UseGuards(JwtGuard)
  @ApiResponse({ type: UserResponseDto })
  selfUpdateProfile(@Body() dto: SelfUpdateUserDto, @Req() req) {
    const { userId } = req.user;
    return this.userService.selfUpdateProfile(userId, dto);
  }
}
