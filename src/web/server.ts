import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { configurePassport } from '../core/passport.js';
// Import API routes to run on same server
import petsRoutes from '../api/pets.js';
import packsRoutes from '../api/packs.js';
import listersRoutes from '../api/listers.js';
import checkoutApiRoutes from '../api/checkout.js';
import paypalRoutes from '../api/paypal.js';

const app = express();
const PORT = process.env.WEB_PORT || 3000;

// Get project root directory (works for both dev and build)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const viewsDir = path.join(projectRoot, 'src', 'web', 'views');
const publicDir = path.join(projectRoot, 'src', 'web', 'public');

// View engine
app.set('view engine', 'ejs');
app.set('views', viewsDir);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    },
  })
);

// Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// API routes (mounted directly on web server to share session)
app.use('/api/pets', petsRoutes);
app.use('/api/packs', packsRoutes);
app.use('/api/listers', listersRoutes);
app.use('/api/checkout', checkoutApiRoutes);
app.use('/api/paypal', paypalRoutes);

// Web routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Web server running on http://localhost:${PORT}`);
});
