import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/response';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { AdminGuard } from 'src/auth/guard/admin.guard';

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
  async getUsers(@Query() query) {
    return this.userService.getAllUser(query);
  }

  @Get(':id')
  @ApiResponse({ type: UserResponseDto })
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
