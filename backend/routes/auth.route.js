import express from 'express';
import { registerUser, loginUser, logout, googleAuth, googleCallback, getMe } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
