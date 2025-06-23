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
    if (!auction) return next(new ApiError('Auction not found', 404));
    if (auction.status !== 'active') return next(new ApiError('Auction is not active', 400));
    if (amount <= auction.currentPrice) return next(new ApiError('Bid must be higher than current price', 400));

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