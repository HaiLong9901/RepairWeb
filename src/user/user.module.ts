import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AddressModule } from 'src/address/address.module';
import { CartModule } from 'src/cart/cart.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [AddressModule, CartModule],
})
export class UserModule {}
