import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  isSeen: boolean;

  @ApiProperty()
  content: string;

  @ApiProperty()
  notificationId: string;

  @ApiProperty()
  createdAt: string;
}
