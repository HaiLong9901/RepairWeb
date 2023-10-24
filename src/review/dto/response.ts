import { ApiProperty } from '@nestjs/swagger';

export class GetReviewResponseDto {
  @ApiProperty()
  reviewId: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  user: {
    accountName: string;
    imageUrl: string;
  };

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  serviceId: number;
}

export class CreateReviewResponseDto {
  @ApiProperty()
  reviewId: string;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  serviceId: number;
}
