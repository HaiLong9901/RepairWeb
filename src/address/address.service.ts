import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddressRequestDto } from './dto/request.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}
  async createAdress(dto: AddressRequestDto) {
    try {
      const { userId } = dto;
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });

      //   if (!user) {

      //   }
      return user;
    } catch (error) {}
  }
}
