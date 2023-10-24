import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString } from 'class-validator';

export class CreateReviewRequestDto {
  @ApiProperty()
  @IsPositive()
  rate: number;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsPositive()
  serviceId: number;
}

export class UpdateReviewRequestDto {
  @ApiProperty()
  @IsPositive()
  reviewId: number;

  @ApiProperty()
  @IsPositive()
  rate: number;

  @ApiProperty()
  @IsString()
  content: string;
}
