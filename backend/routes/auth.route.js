import express from 'express';
import { registerUser, loginUser, logout, googleAuth, googleCallback, getUser } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logout);
router.get('/user', authMiddleware, getUser);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
