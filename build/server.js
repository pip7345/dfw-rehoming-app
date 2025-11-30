import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import pagesRoutes from './routes/pages.js';
import apiAuth from './api/auth.js';
import expressStatic from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'web', 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressStatic.static(path.join(process.cwd(), 'src', 'web', 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', pagesRoutes);
app.use('/api', apiAuth);
// Root handled in pagesRoutes
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
