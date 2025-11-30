import { prisma } from './prisma.js';
export const PacksRepo = {
    findById(id) {
        return prisma.packs.findUnique({
            where: { id },
            include: {
                pets: true,
                lister: { include: { user: true } }
            }
        });
    },
    // Alias for findById - includes pets
    findWithPets(id) {
        return prisma.packs.findUnique({
            where: { id },
            include: {
                pets: true,
                lister: { include: { location: true, user: true } }
            }
        });
    },
    findByListerId(lister_id) {
        return prisma.packs.findMany({
            where: { lister_id },
            include: { pets: true },
            orderBy: { created_at: 'desc' }
        });
    },
    create(data) {
        return prisma.packs.create({
            data: {
                lister_id: data.lister_id,
                name: data.name,
                description: data.description
            },
            include: { pets: true }
        });
    },
    update(id, data) {
        return prisma.packs.update({
            where: { id },
            data,
            include: { pets: true }
        });
    },
    delete(id) {
        return prisma.packs.delete({ where: { id } });
    },
    // Get pack with all details for public view
    getPublicView(id) {
        return prisma.packs.findUnique({
            where: { id },
            include: {
                pets: {
                    where: {
                        status: { not: 'hidden' },
                        expiry_date: { gte: new Date() }
                    }
                },
                lister: {
                    include: {
                        user: {
                            select: {
                                display_name: true,
                                profile_photo_url: true
                            }
                        }
                    }
                }
            }
        });
    }
};
