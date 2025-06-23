import express from 'express';
import { placeBid } from '../controllers/bid.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:auctionId/bid', authMiddleware, placeBid);

export default router; 