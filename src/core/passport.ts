import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { UsersRepo } from './usersRepo.js';

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await UsersRepo.findByEmail(email);
          if (!user || !user.password_hash) return done(null, false, { message: 'Invalid email or password' });
          const match = await bcrypt.compare(password, user.password_hash);
          if (!match) return done(null, false, { message: 'Invalid email or password' });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

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
}
