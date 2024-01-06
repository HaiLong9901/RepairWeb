import { ApiProperty } from '@nestjs/swagger';
import { Skill, UserAddress } from '@prisma/client';
import { formatBigInt } from 'src/utils/formatResponse';

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
  skills?: any;

  @ApiProperty()
  address?: UserAddress[];

  public static formatDto(user: any): UserResponseDto {
    return {
      userId: user.userId,
      accountName: user.accountName,
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob,
      phone: user.phone,
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      status: user.status,
      skills: user?.repairmanSkill?.map((skill: Skill) => {
        return {
          skillName: skill.name,
          skillId: skill.skillId,
        };
      }),
      address: user?.address?.map((addr: UserAddress) => formatBigInt(addr)),
    };
  }
}

export class SwitchUserStatusResponseDto {
  @ApiProperty()
  message: string;
}
