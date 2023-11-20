import { Role } from 'src/enum/role';
import { CreateUserReqestDto } from './request';

export const customer: CreateUserReqestDto = {
  firstName: 'Long',
  lastName: 'Đỗ Hải',
  password: 'Hust123456@',
  phone: '0123654987',
  email: 'longdh@gmail.com',
  dob: '09/09/2001',
  role: Role.ROLE_USER,
  gender: true,
};

export const admin: CreateUserReqestDto = {
  firstName: 'Yến',
  lastName: 'Nguyễn Hải',
  password: 'Hust123456@',
  phone: '0123666585',
  email: 'yennh@gmail.com',
  dob: '09/03/1999',
  role: Role.ROLE_ADMIN,
  gender: false,
};

export const repairman: CreateUserReqestDto = {
  firstName: 'Hoàng',
  lastName: 'Nguyễn Văn',
  password: 'Hust123456@',
  phone: '0123566878',
  email: 'hoangnv@gmail.com',
  dob: '07/08/1995',
  role: Role.ROLE_REPAIRMAN,
  gender: true,
};

export const superAdmin: CreateUserReqestDto = {
  firstName: 'Hồng',
  lastName: 'Trần Thị',
  password: 'Hust123456@',
  phone: '0555888999',
  email: 'hongtt@gmail.com',
  dob: '07/08/1996',
  role: Role.ROLE_SUPERADMIN,
  gender: false,
};
