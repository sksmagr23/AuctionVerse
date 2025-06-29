import express from 'express';
import { createAuction, joinAuction, getAuction, endAuction, getAllAuctions, registerForAuction, getRegisteredParticipants } from '../controllers/auction.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/', getAllAuctions);
router.post('/', authMiddleware, upload.single('itemImage'), createAuction);
router.post('/:auctionId/register', authMiddleware, registerForAuction);
router.get('/:auctionId/registered-participants', authMiddleware, getRegisteredParticipants);
router.post('/:auctionId/join', authMiddleware, joinAuction);
router.post('/:auctionId/end', authMiddleware, endAuction);
router.get('/:auctionId', getAuction);

export default router; 