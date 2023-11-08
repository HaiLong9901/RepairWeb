import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPositive,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserReqestDto {
  @ApiProperty()
  @IsString()
  userId?: string;

  @ApiProperty()
  @IsString()
  accountName?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @IsString()
  dob: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsPositive()
  role: number;

  @ApiProperty()
  @IsBoolean()
  gender: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  skills?: number[];
}

export class UpdateUserRequestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  dob: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsBoolean()
  gender: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  skills: number[];
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsStrongPassword()
  oldPassword: string;

  @ApiProperty()
  @IsStrongPassword()
  newPassword: string;
}

export class SelfUpdateUserDto {
  @ApiProperty()
  @IsString()
  accountName: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @IsString()
  dob: string;

  @ApiProperty()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsBoolean()
  gender: boolean;
}
