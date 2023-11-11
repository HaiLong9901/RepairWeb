import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
  cleanDb() {
    console.log('delete...');
    // return this.$transaction([
    //   this.malfunctionCategory.deleteMany(),
    //   this.cart.deleteMany(),
    //   this.otp.deleteMany(),
    //   this.user.deleteMany(),
    //   this.service.deleteMany(),
    //   this.skill.deleteMany(),
    // ]);
  }
}
