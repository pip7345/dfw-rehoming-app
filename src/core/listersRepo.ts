import { prisma } from './prisma.js';
import type { Prisma } from '@prisma/client';

const DEFAULT_LOCATION_ID = 'dfw-default-location';

export interface ContactPreferences {
  preferred_method?: 'email' | 'phone' | 'facebook';
  show_email?: boolean;
  show_phone?: boolean;
  show_messenger?: boolean;
  email?: string;
  phone?: string;
  messenger_username?: string;
}

export const ListersRepo = {
  findById(id: string) {
    return prisma.listers.findUnique({
      where: { id },
      include: { user: true, location: true, packs: { include: { pets: true } } }
    });
  },

  findByUserId(user_id: string) {
    return prisma.listers.findUnique({
      where: { user_id },
      include: { user: true, location: true, packs: { include: { pets: true } } }
    });
  },

  // Get or create lister for a user
  async getOrCreate(user_id: string) {
    const existing = await prisma.listers.findUnique({
      where: { user_id },
      include: { user: true, location: true, packs: { include: { pets: true } } }
    });

    if (existing) return existing;

    return prisma.listers.create({
      data: {
        user_id,
        contact_preferences: {} as Prisma.InputJsonValue,
        location_id: DEFAULT_LOCATION_ID
      },
      include: { user: true, location: true, packs: { include: { pets: true } } }
    });
  },

  async updateContactPreferences(id: string, prefs: ContactPreferences) {
    return prisma.listers.update({
      where: { id },
      data: {
        contact_preferences: prefs as Prisma.InputJsonValue
      },
      include: { user: true, location: true }
    });
  },

  update(id: string, data: { is_published?: boolean }) {
    return prisma.listers.update({
      where: { id },
      data
    });
  },

  updateProfile(id: string, data: { display_name?: string; about?: string; contact_preferences?: ContactPreferences }) {
    const updateData: any = {};
    if (typeof data.display_name !== 'undefined') updateData.display_name = data.display_name;
    if (typeof data.about !== 'undefined') updateData.about = data.about;
    if (typeof data.contact_preferences !== 'undefined') {
      updateData.contact_preferences = data.contact_preferences as Prisma.InputJsonValue;
    }
    return prisma.listers.update({
      where: { id },
      data: updateData,
      include: { user: true, location: true }
    });
  }
};
