import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  dob: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  role: number;

  @ApiProperty()
  gender: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  skills?: Skill[];
}
