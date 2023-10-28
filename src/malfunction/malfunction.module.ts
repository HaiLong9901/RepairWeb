import { Module } from '@nestjs/common';
import { MalfunctionService } from './malfunction.service';
import { MalfunctionController } from './malfunction.controller';

@Module({
  providers: [MalfunctionService],
  controllers: [MalfunctionController]
})
export class MalfunctionModule {}
