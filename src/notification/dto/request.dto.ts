import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class NotificationRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsBoolean()
  isSeen: boolean;

  @ApiProperty()
  @IsString()
  content: string;
}
