import express from 'express';
import { registerUser, loginUser, logout, googleAuth, googleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
