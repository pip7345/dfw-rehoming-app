import { Router } from 'express';
import { PetsRepo } from '../core/petsRepo.js';
const router = Router();
// Search pets (public)
router.get('/search', async (req, res) => {
    try {
        const { q: query, breed, age, animal_type, size, gender, min_price, max_price, sort, limit, offset } = req.query;
        const pets = await PetsRepo.search({
            query: query,
            breed: breed,
            age: age,
            animal_type: animal_type,
            size: size,
            gender: gender,
            minPrice: min_price ? parseFloat(min_price) : undefined,
            maxPrice: max_price ? parseFloat(max_price) : undefined,
            sortBy: sort || 'newest',
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0
        });
        res.json({ ok: true, pets });
    }
    catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});
// Get single pet (public)
router.get('/:id', async (req, res) => {
    try {
        const pet = await PetsRepo.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ ok: false, error: 'Pet not found' });
        }
        res.json({ ok: true, pet });
    }
    catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});
// Create pet (authenticated)
router.post('/', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }
    try {
        const { pack_id, name, age, animal_type, breed, size, gender, rehoming_fee, status, custom_availability_date, expiry_date, description, cloudinary_public_ids } = req.body;
        if (!expiry_date) {
            return res.status(400).json({ ok: false, error: 'expiry_date is required' });
        }
        const pet = await PetsRepo.create({
            pack_id,
            name,
            age,
            animal_type,
            breed,
            size,
            gender,
            rehoming_fee: rehoming_fee !== undefined ? parseFloat(rehoming_fee) : undefined,
            status,
            custom_availability_date: custom_availability_date ? new Date(custom_availability_date) : undefined,
            expiry_date: new Date(expiry_date),
            description,
            cloudinary_public_ids
        });
        res.status(201).json({ ok: true, pet });
    }
    catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});
// Update pet (authenticated)
router.put('/:id', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }
    try {
        const { name, age, animal_type, breed, size, gender, rehoming_fee, status, custom_availability_date, expiry_date, description, cloudinary_public_ids } = req.body;
        const pet = await PetsRepo.update(req.params.id, {
            name,
            age,
            animal_type,
            breed,
            size,
            gender,
            rehoming_fee: rehoming_fee !== undefined ? parseFloat(rehoming_fee) : undefined,
            status,
            custom_availability_date: custom_availability_date ? new Date(custom_availability_date) : null,
            expiry_date: expiry_date ? new Date(expiry_date) : undefined,
            description,
            cloudinary_public_ids
        });
        res.json({ ok: true, pet });
    }
    catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});
// Delete pet (authenticated)
router.delete('/:id', async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
    }
    try {
        await PetsRepo.delete(req.params.id);
        res.json({ ok: true });
    }
    catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});
export default router;
