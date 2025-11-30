import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { UsersRepo } from '../core/usersRepo.js';

const api = Router();

api.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: Error | null, user: any, info: { message?: string }) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ ok: false, error: info?.message || 'Invalid credentials' });
    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      return res.json({ ok: true, user: { id: user.id, email: user.email, display_name: user.display_name, email_verified: user.email_verified } });
    });
  })(req, res, next);
});

api.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || !display_name) return res.status(400).json({ ok: false, error: 'Missing fields' });
  try {
    const existing = await UsersRepo.findByEmail(email);
    if (existing) return res.status(409).json({ ok: false, error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await UsersRepo.create({ email, password_hash: hash, display_name, email_verified: false });
    res.status(201).json({ ok: true, user: { id: user.id, email: user.email, display_name: user.display_name, email_verified: user.email_verified } });
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Could not register' });
  }
});

api.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

export default api;
