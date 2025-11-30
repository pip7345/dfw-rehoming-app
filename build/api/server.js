import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import authRoutes from './auth.js';
import paypalRoutes from './paypal.js';
import petsRoutes from './pets.js';
import packsRoutes from './packs.js';
import listersRoutes from './listers.js';
import checkoutRoutes from './checkout.js';
import { configurePassport } from '../core/passport.js';
const app = express();
const PORT = process.env.API_PORT || 3001;
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:3000';
// CORS for cross-origin requests from web server
app.use(cors({
    origin: WEB_ORIGIN,
    credentials: true,
}));
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Session (shared secret for session compatibility)
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));
// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/auth', authRoutes);
app.use('/paypal', paypalRoutes);
app.use('/pets', petsRoutes);
app.use('/packs', packsRoutes);
app.use('/listers', listersRoutes);
app.use('/checkout', checkoutRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'Not found' });
});
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
