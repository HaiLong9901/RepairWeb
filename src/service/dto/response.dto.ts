import { ApiProperty } from '@nestjs/swagger';
import { Skill } from '@prisma/client';

export class ServiceResponseDto {
  @ApiProperty()
  serviceId: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  rate: number;

  @ApiProperty()
  desc: string;

  @ApiProperty()
  skill: Skill;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  malfunction?: any;

  public static formatDto(service: any): ServiceResponseDto {
    return {
      serviceId: service.serviceId,
      name: service.name,
      type: service.type,
      price: service.price,
      rate: service.rate,
      desc: service.desc,
      skill: service.skill,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      image: service.image,
      malfunction: service.malfunction,
    };
  }
}
