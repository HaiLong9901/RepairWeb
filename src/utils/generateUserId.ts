import { Role } from 'src/enum/role';

export const generateUserId = (phone: string, role: number) => {
  const date = Date.now().toString();
  const prev =
    role === Role.ROLE_USER ? 'CUS' : role === Role.ROLE_ADMIN ? 'ADM' : 'REP';
  const id =
    prev +
    phone.slice(phone.length - 4, phone.length) +
    date.slice(date.length - 4, date.length);
  return id;
};
