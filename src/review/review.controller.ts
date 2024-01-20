import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateReviewResponseDto, GetReviewResponseDto } from './dto/response';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { CustomerGuard } from 'src/auth/guard/customer.guard';
import { CreateReviewRequestDto, UpdateReviewRequestDto } from './dto/request';
import { StaffGuard } from 'src/auth/guard/staff.guard';

@Controller('review')
@ApiTags('Review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('getAllByServiceId/:serviceId')
  @ApiResponse({ type: GetReviewResponseDto, isArray: true })
  getAllByServiceId(@Param('serviceId', ParseIntPipe) serviceId: number) {
    return this.reviewService.getReviewsByServiceId(serviceId);
  }

  @Post('createReview')
  @UseGuards(JwtGuard, CustomerGuard)
  @ApiResponse({ type: CreateReviewResponseDto })
  createReview(@Body() dto: CreateReviewRequestDto, @Req() req) {
    const { userId } = req.user;
    return this.reviewService.createReview(dto, userId);
  }

  @Patch('updateReview')
  @UseGuards(JwtGuard, CustomerGuard)
  @ApiResponse({ type: CreateReviewResponseDto })
  updateReview(@Body() dto: UpdateReviewRequestDto, @Req() req) {
    const user = req.user;
    return this.reviewService.updateReview(dto, user);
  }

  @Delete('delete/:id')
  @UseGuards(JwtGuard)
  @ApiResponse({
    type: class Message {
      message: string;
    },
  })
  deleteReview(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const { userId } = req.user;
    return this.reviewService.deleteReview(id, userId);
  }

  @Get('getAll')
  @UseGuards(JwtGuard, StaffGuard)
  @ApiResponse({ type: GetReviewResponseDto })
  getAllReview() {
    return this.reviewService.getAllReviews();
  }
}
