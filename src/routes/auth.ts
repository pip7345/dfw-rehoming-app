import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import bcrypt from 'bcrypt';
import { UsersRepo } from '../core/usersRepo.js';

// Use core repository instead of direct Prisma client
const router = Router();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UsersRepo.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await UsersRepo.findByEmail(email);
      if (!user || !user.password_hash) return done(null, false, { message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
if (facebookAppId && facebookAppSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: facebookAppId,
        clientSecret: facebookAppSecret,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails']
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const fbId = profile.id;
          const email = profile.emails?.[0]?.value || null;
          const displayName = profile.displayName || 'Facebook User';

          let user = await UsersRepo.findByFacebookId(fbId);
          if (!user) {
            if (email) {
              const byEmail = await UsersRepo.findByEmail(email);
              if (byEmail) {
                user = await UsersRepo.updateByEmail(email, { facebook_id: fbId, email_verified: true, display_name: displayName });
              }
            }
          }
          if (!user) {
            user = await UsersRepo.create({ facebook_id: fbId, email, display_name: displayName, email_verified: true });
          }
          return done(null, user);
        } catch (err) {
          return done(err as any);
        }
      }
    )
  );
}

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login'
}));

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || !display_name) return res.status(400).send('Missing fields');
  const hash = await bcrypt.hash(password, 10);
  try {
    const user = await UsersRepo.create({ email, password_hash: hash, display_name, email_verified: false });
    // Auto-login after registration
    req.login(user, (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.redirect('/login');
      }
      res.redirect('/dashboard');
    });
  } catch (e) {
    res.status(400).send('Could not register');
  }
});

// Facebook OAuth temporarily disabled

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
