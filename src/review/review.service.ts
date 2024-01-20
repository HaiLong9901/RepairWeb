import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewRequestDto, UpdateReviewRequestDto } from './dto/request';
import { formatBigInt } from 'src/utils/formatResponse';
import { User } from '@prisma/client';
import { Role } from 'src/enum/role';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(dto: CreateReviewRequestDto, userId: string) {
    try {
      const existedService = await this.prisma.service.findUnique({
        where: {
          serviceId: dto.serviceId,
        },
        include: {
          reviews: true,
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
      if (
        Array.isArray(existedService.reviews) &&
        existedService.reviews.length > 0
      ) {
        const rate = Math.round(
          (existedService.reviews.reduce(
            (total, reviewRate) => (total += reviewRate.rate),
            0,
          ) +
            dto.rate) /
            (existedService.reviews.length + 1),
        );

        await this.prisma.service.update({
          where: {
            serviceId: dto.serviceId,
          },
          data: {
            rate,
          },
        });
      }
      return formatBigInt(review);
    } catch (error) {
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
      throw error;
    }
  }

  async deleteReview(reviewId: number, user: User) {
    try {
      const existedReview = await this.prisma.review.findUnique({
        where: {
          reviewId,
        },
      });

      if (!existedReview) {
        return new NotFoundException('Review is not found');
      }

      if (
        existedReview.userId !== user.userId &&
        user.role === Role.ROLE_USER
      ) {
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
      throw error;
    }
  }

  async getReviewsByServiceId(serviceId: number) {
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
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (reviews.length === 0) return reviews;
      return reviews.map((val) => formatBigInt(val));
    } catch (error) {
      throw error;
    }
  }

  async getAllReviews(query: any) {
    const { serviceId, rate } = query;
    try {
      const querySelect: any = {};
      if (serviceId) {
        querySelect.serviceId = parseInt(serviceId);
      }
      if (rate) {
        querySelect.rate = parseInt(rate);
      }
      const reviews = await this.prisma.review.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          user: {
            select: {
              accountName: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
        },
        where: {
          ...querySelect,
        },
      });
      // console.log({ reviews });
      return reviews.map((val) => formatBigInt(val));
    } catch (error) {
      throw error;
    }
  }
}
