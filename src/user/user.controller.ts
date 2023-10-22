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
import { PrismaService } from 'src/prisma/prisma.service';
import { RepairmanGuard } from 'src/auth/guard/repairman.guard';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
  ) {}

  @Get('getAll')
  @UseGuards(AdminGuard)
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiResponse({ type: UserResponseDto, isArray: true })
  async getUsers(@Query() query) {
    return this.userService.getAllUser(query);
  }

  @Get(':id')
  @ApiResponse({ type: UserResponseDto })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('createUser')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: UserResponseDto })
  async createUser(@Body() dto: CreateUserReqestDto) {
    return this.userService.createUser(dto);
  }

  @Patch('updateUser')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: UserResponseDto })
  async updateUser(@Body() dto: UpdateUserRequestDto) {
    return this.userService.updateUser(dto);
  }

  @Patch('switchUserActiveStatus')
  @UseGuards(AdminGuard)
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  async switchUserActiveStatus(@Body() status: number, @Body() userId: string) {
    return this.userService.switchUserActiveStatus(userId, status);
  }

  @Patch('updateRepairmanStatus')
  @UseGuards(RepairmanGuard)
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  async updateRepairmanStatus(@Body() status: number, @Req() req) {
    const { userId } = req.user;
    return this.userService.updateRepairmanStatus(userId, status);
  }

  @Patch('changePassword')
  @ApiResponse({ type: SwitchUserStatusResponseDto })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req) {
    const { userId } = req.user;
    return this.userService.changePassword(userId, dto);
  }

  @Patch('updateProfile')
  @ApiResponse({ type: UserResponseDto })
  async selfUpdateProfile(@Body() dto: SelfUpdateUserDto, @Req() req) {
    const { userId } = req.user;
    return this.userService.selfUpdateProfile(userId, dto);
  }
}
