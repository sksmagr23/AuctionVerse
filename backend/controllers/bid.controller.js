import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';

export const placeBid = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;

    const auction = await Auction.findById(auctionId);
    if (!auction) return next(new ApiError(404, 'Auction not found'));
    if (auction.status !== 'active') return next(new ApiError(400, 'Auction is not active'));
    if (amount <= auction.currentPrice) return next(new ApiError(400, 'Bid must be higher than current price'));

    const bid = await Bid.create({
      auction: auctionId,
      bidder: userId,
      amount,
    });

    auction.currentPrice = amount;
    if (!auction.participants.includes(userId)) {
      auction.participants.push(userId);
    }
    await auction.save();

    getIO().to(auctionId).emit('bidPlaced', {
      bid: {
        _id: bid._id,
        auction: bid.auction,
        bidder: userId,
        amount: bid.amount,
        timestamp: bid.timestamp,
      },
      currentPrice: auction.currentPrice
    });

    res.status(201).json({ success: true, bid, currentPrice: auction.currentPrice });
  } catch (err) {
    next(err);
  }
}; 