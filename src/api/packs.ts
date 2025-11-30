import { Router } from 'express';
import { PacksRepo } from '../core/packsRepo.js';
import { ListersRepo } from '../core/listersRepo.js';

const router = Router();

// Get pack with pets (public)
router.get('/:id', async (req, res) => {
  try {
    const pack = await PacksRepo.findWithPets(req.params.id);
    if (!pack) {
      return res.status(404).json({ ok: false, error: 'Pack not found' });
    }
    res.json({ ok: true, pack });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get packs for current user (authenticated)
router.get('/', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    // Get or create lister for user
    const lister = await ListersRepo.getOrCreate(user.id);
    const packs = await PacksRepo.findByListerId(lister.id);
    res.json({ ok: true, packs });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Create pack (authenticated)
router.post('/', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    // Get or create lister for user
    const lister = await ListersRepo.getOrCreate(user.id);
    
    const { name, description, cloudinary_public_ids } = req.body;

    if (!name) {
      return res.status(400).json({ ok: false, error: 'Pack name is required' });
    }

    const pack = await PacksRepo.create({
      lister_id: lister.id,
      name,
      description,
      cloudinary_public_ids: cloudinary_public_ids || []
    });

    res.status(201).json({ ok: true, pack });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Update pack (authenticated)
router.put('/:id', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    const { name, description, cloudinary_public_ids } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cloudinary_public_ids !== undefined) updateData.cloudinary_public_ids = cloudinary_public_ids;

    const pack = await PacksRepo.update(req.params.id, updateData);

    res.json({ ok: true, pack });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Delete pack (authenticated)
router.delete('/:id', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    await PacksRepo.delete(req.params.id);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
