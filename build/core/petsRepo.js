import { prisma } from './prisma.js';
export const PetsRepo = {
    findById(id) {
        return prisma.pets.findUnique({
            where: { id },
            include: { pack: { include: { lister: { include: { user: true } } } }, receipt: true }
        });
    },
    findByPackId(pack_id) {
        return prisma.pets.findMany({
            where: { pack_id },
            orderBy: { created_at: 'asc' }
        });
    },
    async search(params) {
        const { query, breed, age, animal_type, size, gender, minPrice, maxPrice, includeHidden = false, includeExpired = false, sortBy = 'newest', limit = 50, offset = 0 } = params;
        const where = {
            AND: []
        };
        // Text search on name, breed, description, and enum fields
        // Also support searching by age/size/animal_type display text
        if (query) {
            const q = query.toLowerCase();
            // Map common search terms to enum values
            const ageMatches = [];
            const sizeMatches = [];
            const typeMatches = [];
            // Age keyword mapping
            if (q.includes('puppy') || q.includes('young') || q.includes('baby')) {
                ageMatches.push('less_than_8_months');
            }
            if (q.includes('adult')) {
                ageMatches.push('one_to_3_years', 'four_to_7_years');
            }
            if (q.includes('senior') || q.includes('old')) {
                ageMatches.push('eight_plus_years');
            }
            // Size keyword mapping
            if (q.includes('small') || q.includes('tiny') || q.includes('mini')) {
                sizeMatches.push('small');
            }
            if (q.includes('medium')) {
                sizeMatches.push('medium');
            }
            if (q.includes('large') || q.includes('big')) {
                sizeMatches.push('large', 'extra_large');
            }
            // Animal type keyword mapping
            if (q.includes('dog') || q.includes('puppy') || q.includes('pup')) {
                typeMatches.push('dog');
            }
            if (q.includes('cat') || q.includes('kitten') || q.includes('kitty')) {
                typeMatches.push('cat');
            }
            if (q.includes('other') || q.includes('bird') || q.includes('rabbit') || q.includes('hamster')) {
                typeMatches.push('other');
            }
            // Gender keyword mapping
            const genderMatches = [];
            if (q.includes('male') || q.includes('boy')) {
                genderMatches.push('male');
            }
            if (q.includes('female') || q.includes('girl')) {
                genderMatches.push('female');
            }
            const searchConditions = [
                { name: { contains: query, mode: 'insensitive' } },
                { breed: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ];
            if (ageMatches.length > 0) {
                searchConditions.push({ age: { in: ageMatches } });
            }
            if (sizeMatches.length > 0) {
                searchConditions.push({ size: { in: sizeMatches } });
            }
            if (typeMatches.length > 0) {
                searchConditions.push({ animal_type: { in: typeMatches } });
            }
            if (genderMatches.length > 0) {
                searchConditions.push({ gender: { in: genderMatches } });
            }
            where.AND.push({ OR: searchConditions });
        }
        // Filters
        if (breed) {
            where.AND.push({ breed: { contains: breed, mode: 'insensitive' } });
        }
        if (age) {
            where.AND.push({ age });
        }
        if (animal_type) {
            where.AND.push({ animal_type });
        }
        if (size) {
            where.AND.push({ size });
        }
        if (gender) {
            where.AND.push({ gender });
        }
        // Price range filter
        if (minPrice !== undefined && minPrice !== null) {
            where.AND.push({ rehoming_fee: { gte: minPrice } });
        }
        if (maxPrice !== undefined && maxPrice !== null) {
            where.AND.push({ rehoming_fee: { lte: maxPrice } });
        }
        // Exclude hidden unless requested
        if (!includeHidden) {
            where.AND.push({ status: { not: 'hidden' } });
        }
        // Exclude sold and reserved pets from public view
        where.AND.push({
            status: {
                notIn: ['sold', 'reserved']
            }
        });
        // Exclude expired unless requested
        if (!includeExpired) {
            where.AND.push({ expiry_date: { gte: new Date() } });
        }
        // Determine sort order
        let orderBy;
        switch (sortBy) {
            case 'oldest':
                orderBy = { created_at: 'asc' };
                break;
            case 'expiring':
                orderBy = { expiry_date: 'asc' };
                break;
            case 'price_low':
                orderBy = { rehoming_fee: 'asc' };
                break;
            case 'price_high':
                orderBy = { rehoming_fee: 'desc' };
                break;
            default:
                orderBy = { created_at: 'desc' };
        }
        return prisma.pets.findMany({
            where: where.AND.length > 0 ? where : undefined,
            include: { pack: { include: { lister: { include: { user: true } } } } },
            orderBy,
            take: limit,
            skip: offset
        });
    },
    create(data) {
        return prisma.pets.create({
            data: {
                pack_id: data.pack_id,
                Receipt_id: data.Receipt_id,
                name: data.name,
                age: data.age,
                animal_type: data.animal_type || 'dog',
                breed: data.breed,
                size: data.size,
                gender: data.gender || 'male',
                rehoming_fee: data.rehoming_fee ?? 50,
                status: data.status || 'available',
                custom_availability_date: data.custom_availability_date,
                expiry_date: data.expiry_date,
                description: data.description,
                cloudinary_public_ids: data.cloudinary_public_ids
            }
        });
    },
    update(id, data) {
        return prisma.pets.update({
            where: { id },
            data
        });
    },
    delete(id) {
        return prisma.pets.delete({ where: { id } });
    }
};
