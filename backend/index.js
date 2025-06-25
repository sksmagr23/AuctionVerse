import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import passport from './config/passport.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.route.js';
import auctionRoutes from './routes/auction.route.js';
import bidRoutes from './routes/bid.route.js';
import authMiddleware from './middleware/auth.middleware.js'
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';
import { initSocket } from './config/socket.js';
import { auctionStatusUpdater } from './utils/auctionStatusUpdater.js';

connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

const server = http.createServer(app);
const io = initSocket(server);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(authMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/bid', bidRoutes);

auctionStatusUpdater();

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: err.errors || [],
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
