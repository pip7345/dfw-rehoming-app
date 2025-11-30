import { Router } from 'express';
import { ListersRepo, ContactPreferences } from '../core/listersRepo.js';
import { PacksRepo } from '../core/packsRepo.js';

const router = Router();

// Get current user's lister profile (authenticated)
router.get('/me', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    const lister = await ListersRepo.getOrCreate(user.id);
    const packs = await PacksRepo.findByListerId(lister.id);
    res.json({ ok: true, lister, packs });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Update profile settings (authenticated)
router.put('/me/profile', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    const { display_name, about, email, phone, show_email, show_phone, messenger_username, show_messenger } = req.body;

    const lister = await ListersRepo.getOrCreate(user.id);
    // Update both lister base profile and contact preferences
    const updated = await ListersRepo.updateProfile(lister.id, {
      display_name,
      about,
      contact_preferences: {
        email,
        phone,
        show_email,
        show_phone,
        messenger_username,
        show_messenger
      }
    });

    res.json({ ok: true, lister: updated });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Update contact preferences (authenticated)
router.put('/me/contact', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }

  try {
    const { phone, email, show_email, show_phone, messenger_username, show_messenger } = req.body;

    const lister = await ListersRepo.getOrCreate(user.id);
    const updated = await ListersRepo.updateContactPreferences(lister.id, {
      phone,
      email,
      show_email,
      show_phone,
      messenger_username,
      show_messenger
    });

    res.json({ ok: true, lister: updated });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Get lister by ID (public - for viewing listing contact info)
router.get('/:id', async (req, res) => {
  try {
    const lister = await ListersRepo.findById(req.params.id);
    if (!lister) {
      return res.status(404).json({ ok: false, error: 'Lister not found' });
    }

    // Extract contact_preferences from JSON field
    const prefs = (lister.contact_preferences as ContactPreferences) || {};
    
    // Only return public contact info
    const publicLister = {
      id: lister.id,
      show_email: prefs.show_email,
      show_phone: prefs.show_phone,
      email: prefs.show_email ? prefs.email : null,
      phone: prefs.show_phone ? prefs.phone : null,
      location: lister.location
    };

    res.json({ ok: true, lister: publicLister });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
