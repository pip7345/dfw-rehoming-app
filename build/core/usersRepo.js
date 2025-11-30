import { prisma } from './prisma.js';
export const UsersRepo = {
    findById(id) {
        return prisma.users.findUnique({ where: { id } });
    },
    findByEmail(email) {
        return prisma.users.findUnique({ where: { email } });
    },
    findByFacebookId(facebook_id) {
        return prisma.users.findUnique({ where: { facebook_id } });
    },
    create(data) {
        return prisma.users.create({ data });
    },
    updateByEmail(email, data) {
        return prisma.users.update({ where: { email }, data });
    },
};
