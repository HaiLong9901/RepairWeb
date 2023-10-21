import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsPositive,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserReqestDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  accountName: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  @IsDate()
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
}
