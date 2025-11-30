import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { UsersRepo } from '../core/usersRepo.js';
import { PetsRepo } from '../core/petsRepo.js';
import { PacksRepo } from '../core/packsRepo.js';
import { ListersRepo } from '../core/listersRepo.js';
import type { PetAge, PetSize, PetType } from '@prisma/client';

const router = Router();

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset';

// Page routes
router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

// Homepage with pet search
router.get('/', async (req, res) => {
  try {
    const { q: query, animal_type, age, size, min_price, max_price } = req.query;
    
    const pets = await PetsRepo.search({
      query: query as string,
      animal_type: animal_type as PetType,
      age: age as PetAge,
      size: size as PetSize,
      minPrice: min_price ? parseFloat(min_price as string) : undefined,
      maxPrice: max_price ? parseFloat(max_price as string) : undefined,
      includeHidden: false,  // Visitors should not see hidden pets
      includeExpired: false, // Visitors should not see expired listings
      sortBy: 'newest',
      limit: 50
    });

    res.render('index', {
      user: (req as any).user || null,
      pets,
      query: query || '',
      filters: { 
        animal_type: animal_type || '', 
        age: age || '', 
        size: size || '',
        min_price: min_price || '',
        max_price: max_price || ''
      },
      cloudinaryCloud: CLOUDINARY_CLOUD
    });
  } catch (error) {
    console.error('Error loading homepage:', error);
    res.render('index', {
      user: (req as any).user || null,
      pets: [],
      query: '',
      filters: {},
      cloudinaryCloud: CLOUDINARY_CLOUD
    });
  }
});

// Dashboard for authenticated users
router.get('/dashboard', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.redirect('/login');
  }

  try {
    const lister = await ListersRepo.getOrCreate(user.id);
    const packs = await PacksRepo.findByListerId(lister.id);
    
    // Extract contact preferences from JSON
    const contactPrefs = (lister?.contact_preferences as Record<string, any>) || {};
    
    res.render('dashboard', { 
      user, 
      lister,
      contactPrefs,
      packs,
      cloudinaryCloud: CLOUDINARY_CLOUD,
      cloudinaryPreset: CLOUDINARY_PRESET
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('dashboard', { user, lister: null, contactPrefs: {}, packs: [], cloudinaryCloud: CLOUDINARY_CLOUD, cloudinaryPreset: CLOUDINARY_PRESET });
  }
});

// Create/Edit Pack page
router.get('/create-pack', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.redirect('/login');
  }

  try {
    const packId = req.query.id as string;
    let pack = null;
    let pets: any[] = [];

    if (packId) {
      pack = await PacksRepo.findWithPets(packId);
      if (!pack) {
        return res.status(404).render('error', { message: 'Pack not found' });
      }
      pets = pack.pets || [];
    }

    res.render('create-pack', {
      user,
      packId: pack?.id || '',
      packName: pack?.name || '',
      packDescription: pack?.description || '',
      isSinglePet: false,
      pets,
      cloudinaryCloud: CLOUDINARY_CLOUD,
      cloudinaryPreset: CLOUDINARY_PRESET
    });
  } catch (error) {
    console.error('Error loading create-pack:', error);
    res.status(500).render('error', { message: 'Error loading pack' });
  }
});

// View a pack (public)
router.get('/pack/:id', async (req, res) => {
  try {
    const pack = await PacksRepo.findWithPets(req.params.id);
    if (!pack) {
      return res.status(404).render('error', { message: 'Pack not found' });
    }
    
    const lister = await ListersRepo.findById(pack.lister_id);
    
    // Filter pets for visitors - only show paid, non-expired, non-hidden pets
    const user = (req as any).user;
    const isOwner = user && lister && lister.user_id === user.id;
    
    if (!isOwner && pack.pets) {
      const now = new Date();
      pack.pets = pack.pets.filter(pet => 
        // For testing: allow unpaid pets to be visible
        // In production, you might want to uncomment this line:
        // pet.Receipt_id !== null && // Must be paid
        pet.expiry_date >= now && // Not expired
        pet.status !== 'hidden' // Not hidden
      );
    }
    
    // Extract contact info from JSON field
    const contactPrefs = (lister?.contact_preferences as Record<string, any>) || {};
    const listerContact = {
      name: lister?.user?.display_name || 'Lister',
      show_email: true, // Always show email for visitors to contact
      show_phone: contactPrefs.phone ? true : false,
      show_messenger: contactPrefs.messenger_username ? true : false,
      email: lister?.user?.email || null,
      phone: contactPrefs.phone || null,
      messenger_username: contactPrefs.messenger_username || null,
      location: lister?.location
    };
    
    res.render('pack', {
      user: (req as any).user || null,
      pack,
      lister: listerContact,
      cloudinaryCloud: CLOUDINARY_CLOUD
    });
  } catch (error) {
    console.error('Error loading pack:', error);
    res.status(500).render('error', { message: 'Error loading pack' });
  }
});

// Checkout page
router.get('/checkout', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.redirect('/login');
  }

  try {
    const packId = req.query.packId as string;
    const petIdParam = req.query.petIds as string | string[];
    
    let pets: any[] = [];
    let petIds: string[] = [];
    let unpaidPets: any[] = [];
    let packName: string | undefined;
    
    if (petIdParam) {
      petIds = Array.isArray(petIdParam) ? petIdParam : [petIdParam];
      pets = await Promise.all(petIds.map(id => PetsRepo.findById(id)));
      pets = pets.filter(Boolean);
    }

    // If a packId is provided and no explicit petIds, load unpaid pets for that pack
    if (packId && petIds.length === 0) {
      const pack = await PacksRepo.findWithPets(packId);
      if (pack) {
        packName = pack.name;
        unpaidPets = (pack.pets || []).filter(p => !p.Receipt_id);
      }
    }
    
    res.render('checkout', {
      user,
      packId: packId || '',
      petIds,
      pets,
      packName: packName,
      unpaidPetsJson: JSON.stringify(unpaidPets),
      cloudinaryCloud: CLOUDINARY_CLOUD,
      cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset'
    });
  } catch (error) {
    console.error('Error loading checkout:', error);
    res.status(500).render('error', { message: 'Error loading checkout' });
  }
});

// Receipt page
router.get('/receipt/:id', async (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.redirect('/login');
  }

  try {
    const receiptId = req.params.id;
    // Fetch receipt and related pets
    const prisma = (await import('../core/prisma.js')).prisma;
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: { user: true, pets: true }
    });
    if (!receipt) {
      return res.status(404).render('error', { message: 'Receipt not found' });
    }

    // Derive per-pet price and pack grouping
    const pets = receipt.pets || [];
    const petCount = pets.length;
    const perPet = petCount > 0 ? Number(receipt.amount) / petCount : 0;
    const packsMap: Record<string, any[]> = {};
    pets.forEach(p => {
      const key = p.pack_id || 'unassigned';
      if (!packsMap[key]) packsMap[key] = [];
      packsMap[key].push(p);
    });

    res.render('receipt', {
      user,
      receipt,
      pets,
      petCount,
      perPet,
      packsMap,
      cloudinaryCloud: CLOUDINARY_CLOUD
    });
  } catch (error) {
    console.error('Error loading receipt:', error);
    res.status(500).render('error', { message: 'Error loading receipt' });
  }
});

// Form handlers (web-specific, using redirects)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.render('login', { error: info?.message || 'Invalid credentials' });
    }
    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      return res.redirect('/');
    });
  })(req, res, next);
});

router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || !display_name) {
    return res.render('register', { error: 'Missing fields' });
  }
  try {
    const existing = await UsersRepo.findByEmail(email);
    if (existing) {
      return res.render('register', { error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await UsersRepo.create({ email, password_hash: hash, display_name, email_verified: false });
    req.logIn(user, (err) => {
      if (err) return res.render('register', { error: 'Registration succeeded but login failed' });
      return res.redirect('/');
    });
  } catch (e) {
    res.render('register', { error: 'Could not register' });
  }
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

export default router;
