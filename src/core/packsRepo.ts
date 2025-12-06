import { prisma } from './prisma.js';

export interface CreatePackData {
  lister_id: string;
  name: string;
  description?: string;
  cloudinary_public_ids?: string[];
}

export interface UpdatePackData {
  name?: string;
  description?: string | null;
  cloudinary_public_ids?: string[];
}

export const PacksRepo = {
  findById(id: string) {
    return prisma.packs.findUnique({
      where: { id },
      include: {
        pets: true,
        lister: { include: { user: true } }
      }
    });
  },

  // Alias for findById - includes pets
  findWithPets(id: string) {
    return prisma.packs.findUnique({
      where: { id },
      include: {
        pets: true,
        lister: { include: { location: true, user: true } }
      }
    });
  },

  findByListerId(lister_id: string) {
    return prisma.packs.findMany({
      where: { lister_id },
      include: { pets: true },
      orderBy: { created_at: 'desc' }
    });
  },

  create(data: CreatePackData) {
    return prisma.packs.create({
      data: {
        lister_id: data.lister_id,
        name: data.name,
        description: data.description,
        cloudinary_public_ids: data.cloudinary_public_ids || []
      },
      include: { pets: true }
    });
  },

  update(id: string, data: UpdatePackData) {
    return prisma.packs.update({
      where: { id },
      data,
      include: { pets: true }
    });
  },

  async delete(id: string) {
    // First delete all pets associated with this pack
    await prisma.pets.deleteMany({ where: { pack_id: id } });
    // Then delete the pack
    return prisma.packs.delete({ where: { id } });
  },

  // Get pack with all details for public view
  getPublicView(id: string) {
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
