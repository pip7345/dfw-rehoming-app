import { Router, Request, Response } from 'express';
import { PacksRepo } from '../core/packsRepo.js';
import { PetsRepo } from '../core/petsRepo.js';
import { prisma } from '../core/prisma.js';

const router = Router();

// Middleware to check authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ ok: false, error: 'Not authenticated' });
  }
  next();
}

/**
 * POST /checkout/save-listing
 * Saves a pack and its pets after successful PayPal payment
 */
router.post('/save-listing', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId, packName, packDescription, dogs } = req.body;
    const userId = (req.user as any).id;
    const listerId = (req.user as any).lister_id;

    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'Order ID is required' });
    }

    if (!packName || !packName.trim()) {
      return res.status(400).json({ ok: false, error: 'Pack name is required' });
    }

    if (!dogs || !Array.isArray(dogs) || dogs.length === 0) {
      return res.status(400).json({ ok: false, error: 'At least one dog is required' });
    }

    // Calculate total amount
    const listingFee = parseFloat(process.env.PAYPAL_LISTING_FEE || '5.00');
    const totalAmount = listingFee * dogs.length;

    // Create the pack first (skip receipt for now until we fix Prisma types)
    const pack = await PacksRepo.create({
      lister_id: listerId,
      name: packName.trim(),
      description: packDescription?.trim() || undefined,
    });

    // Create all pets (without receipt for now)
    const createdPets = [];
    for (const dog of dogs) {
      const pet = await PetsRepo.create({
        pack_id: pack.id,
        // Receipt_id: receipt.id,  // TODO: Fix Receipt model in Prisma
        name: dog.name,
        breed: dog.breed || undefined,
        age: undefined, // TODO: Map age values from dashboard to schema enums
        size: undefined, // TODO: Map size values from dashboard to schema enums
        status: 'available',
        description: dog.description || undefined,
        expiry_date: dog.expiry_date ? new Date(dog.expiry_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cloudinary_public_ids: dog.cloudinary_public_ids || undefined,
      });
      createdPets.push(pet);
    }

    res.json({
      success: true,
      pack: pack,
      pets: createdPets,
      // receipt: receipt,
    });
  } catch (err: any) {
    console.error('Error saving listing:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
});

/**
 * POST /checkout/bypass-payment
 * Bypass PayPal and create a test receipt (for testing only)
 */
router.post('/bypass-payment', requireAuth, async (req: Request, res: Response) => {
  try {
    const { packId, petIds, receipt } = req.body;
    const userId = (req.user as any).id;

    if (!packId || !petIds || !Array.isArray(petIds) || petIds.length === 0) {
      return res.status(400).json({ ok: false, error: 'Pack ID and pet IDs are required' });
    }

    // Create test receipt
    const createdReceipt = await prisma.receipt.create({
      data: {
        user_id: userId,
        paypal_order_id: receipt.paypal_order_id,
        amount: receipt.amount,
        currency: receipt.currency,
        status: receipt.status,
        paid_at: new Date(),
      }
    });

    // Link all pets to this receipt
    await prisma.pets.updateMany({
      where: { id: { in: petIds } },
      data: { Receipt_id: createdReceipt.id }
    });

    res.json({
      success: true,
      receipt: createdReceipt,
      petsUpdated: petIds.length
    });
  } catch (err: any) {
    console.error('Error bypassing payment:', err);
    res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
});

export default router;
