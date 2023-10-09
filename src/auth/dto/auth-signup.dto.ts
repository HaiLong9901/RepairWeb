import {
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsEmail,
  IsPositive,
  IsBoolean,
  IsStrongPassword,
} from 'class-validator';

export class AuthSignUpRequestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPositive()
  @IsNotEmpty()
  role: number;

  @IsBoolean()
  gender: boolean;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
