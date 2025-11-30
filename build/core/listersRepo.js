import { prisma } from './prisma.js';
const DEFAULT_LOCATION_ID = 'dfw-default-location';
export const ListersRepo = {
    findById(id) {
        return prisma.listers.findUnique({
            where: { id },
            include: { user: true, location: true, packs: { include: { pets: true } } }
        });
    },
    findByUserId(user_id) {
        return prisma.listers.findUnique({
            where: { user_id },
            include: { user: true, location: true, packs: { include: { pets: true } } }
        });
    },
    // Get or create lister for a user
    async getOrCreate(user_id) {
        const existing = await prisma.listers.findUnique({
            where: { user_id },
            include: { user: true, location: true, packs: { include: { pets: true } } }
        });
        if (existing)
            return existing;
        return prisma.listers.create({
            data: {
                user_id,
                contact_preferences: {},
                location_id: DEFAULT_LOCATION_ID
            },
            include: { user: true, location: true, packs: { include: { pets: true } } }
        });
    },
    async updateContactPreferences(id, prefs) {
        return prisma.listers.update({
            where: { id },
            data: {
                contact_preferences: prefs
            },
            include: { user: true, location: true }
        });
    },
    update(id, data) {
        return prisma.listers.update({
            where: { id },
            data
        });
    },
    updateProfile(id, data) {
        const updateData = {};
        if (typeof data.display_name !== 'undefined')
            updateData.display_name = data.display_name;
        if (typeof data.about !== 'undefined')
            updateData.about = data.about;
        if (typeof data.contact_preferences !== 'undefined') {
            updateData.contact_preferences = data.contact_preferences;
        }
        return prisma.listers.update({
            where: { id },
            data: updateData,
            include: { user: true, location: true }
        });
    }
};
