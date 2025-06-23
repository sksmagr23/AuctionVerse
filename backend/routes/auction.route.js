import express from 'express';
import { createAuction, joinAuction, getAuction, endAuction } from '../controllers/auction.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.single('itemImage'), createAuction);
router.post('/:auctionId/join', authMiddleware, joinAuction);
router.post('/:auctionId/end', authMiddleware, endAuction);
router.get('/:auctionId', getAuction);

export default router; 