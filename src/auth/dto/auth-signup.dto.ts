import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsBoolean,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthSignUpRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dob: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsBoolean()
  @ApiProperty()
  gender: boolean;

  @IsStrongPassword()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
