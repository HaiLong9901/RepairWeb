import { IsNotEmpty, IsPhoneNumber, IsStrongPassword } from 'class-validator';

export class AuthSignInRequestDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
