import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationResponseDto } from './dto/response.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('notification')
@ApiTags('Notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('getAllNotification')
  @ApiResponse({ type: NotificationResponseDto, isArray: true })
  @UseGuards(JwtGuard)
  getAllNotification(@Req() req) {
    const { userId } = req.user;
    return this.notificationService.getAllNotification(userId);
  }
}
