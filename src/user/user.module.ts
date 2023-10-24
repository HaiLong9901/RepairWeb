import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressModule } from 'src/address/address.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [AddressModule],
})
export class UserModule {}
