import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewRequestDto, UpdateReviewRequestDto } from './dto/request';
import { formatBigInt } from 'src/utils/formatResponse';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(dto: CreateReviewRequestDto, userId: string) {
    try {
      const existedService = await this.prisma.service.findUnique({
        where: {
          serviceId: dto.serviceId,
        },
      });

      if (!existedService) {
        throw new NotFoundException('Service is not found');
      }

      const review = await this.prisma.review.create({
        data: {
          ...dto,
          userId,
        },
      });

      return formatBigInt(review);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateReview(dto: UpdateReviewRequestDto, userId: string) {
    try {
      const existedReview = await this.prisma.review.findUnique({
        where: {
          reviewId: dto.reviewId,
        },
      });

      if (!existedReview) {
        return new NotFoundException('Review is not found');
      }

      if (existedReview.userId !== userId) {
        return new ForbiddenException(
          'You are not permitted to change this review',
        );
      }

      const updatedReview = await this.prisma.review.update({
        data: {
          rate: dto.rate,
          content: dto.content,
        },
        where: {
          reviewId: dto.reviewId,
        },
      });

      return formatBigInt(updatedReview);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteReview(reviewId: number, userId: string) {
    try {
      const existedReview = await this.prisma.review.findUnique({
        where: {
          reviewId,
        },
      });

      if (!existedReview) {
        return new NotFoundException('Review is not found');
      }

      if (existedReview.userId !== userId) {
        return new ForbiddenException(
          'You are not permitted to delete this review',
        );
      }

      await this.prisma.review.delete({
        where: {
          reviewId,
        },
      });

      return {
        message: 'Delete review successfully',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getReviewsByServiceId(serviceId) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: {
          serviceId,
        },
        include: {
          user: {
            select: {
              accountName: true,
              imageUrl: true,
            },
          },
        },
      });

      if (reviews.length === 0) return reviews;
      return reviews.map((val) => formatBigInt(val));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
