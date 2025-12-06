import { prisma } from './prisma.js';

export const UsersRepo = {
  findById(id: string) {
    return prisma.users.findUnique({ where: { id } });
  },
  findByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } });
  },
  findByFacebookId(facebook_id: string) {
    return prisma.users.findUnique({ where: { facebook_id } });
  },
  create(data: {
    email?: string | null;
    password_hash?: string | null;
    facebook_id?: string | null;
    display_name: string;
    email_verified?: boolean;
  }) {
    return prisma.users.create({ data });
  },
  updateByEmail(email: string, data: Partial<{ facebook_id: string; email_verified: boolean; display_name: string }>) {
    return prisma.users.update({ where: { email }, data });
  },
  updatePasswordById(id: string, password_hash: string) {
    return prisma.users.update({ where: { id }, data: { password_hash } });
  },
  updatePasswordByEmail(email: string, password_hash: string) {
    return prisma.users.update({ where: { email }, data: { password_hash } });
  },
  findAll() {
    return prisma.users.findMany({ orderBy: { created_at: 'desc' } });
  },
};
