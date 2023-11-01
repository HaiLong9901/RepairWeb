import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class NotificationRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isSeen?: boolean;

  @ApiProperty()
  @IsString()
  content: string;
}
