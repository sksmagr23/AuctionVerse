import Auction from '../models/Auction.js';
import { uploadImage } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';
import User from '../models/User.js';
import Bid from '../models/Bid.js';

export const createAuction = async (req, res, next) => {
  try {
    const { title, description, startingPrice, startTime } = req.body;
    let itemImage = null;

    const start = new Date(startTime);
    const oneHour = 60 * 60 * 1000;
    const conflict = await Auction.findOne({
      $or: [
        { startTime: { $lte: new Date(start.getTime() + oneHour), $gte: new Date(start.getTime() - oneHour) } },
      ]
    });
    if (conflict) {
      return next(new ApiError('There must be at least a 1-hour gap between any two auctions.', 400));
    }

    if (req.file) {
      const result = await uploadImage(req.file.path, 'auctionverse/items');
      itemImage = result.secure_url;
    }

    const auction = await Auction.create({
      title,
      description,
      itemImage,
      startingPrice,
      currentPrice: startingPrice,
      startTime,
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    getIO().emit('auctionCreated', auction);

    res.status(201).json({ success: true, auction });
  } catch (err) {
    next(err);
  }
};

export const joinAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) return next(new ApiError('Auction not found', 404));

    if (!auction.participants.includes(req.user._id)) {
      auction.participants.push(req.user._id);
      await auction.save();
      getIO().to(auctionId).emit('userJoined', { userId: req.user._id, auctionId });
    }

    res.json({ success: true, auction });
  } catch (err) {
    next(err);
  }
};

export const endAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) return next(new ApiError('Auction not found', 404));
    if (!auction.createdBy.equals(req.user._id)) return next(new ApiError('Only the creator can end this auction', 403));
    if (auction.status === 'ended') return next(new ApiError('Auction already ended', 400));

    const highestBid = await Bid.findOne({ auction: auctionId }).sort({ amount: -1 });
    let winner = null;
    let winningBid = null;
    if (highestBid) {
      winner = highestBid.bidder;
      winningBid = highestBid.amount;
      await User.findByIdAndUpdate(winner, {
        $push: { wonAuctions: { auction: auction._id, amount: winningBid } }
      });
    }

    auction.status = 'ended';
    auction.winner = winner;
    auction.winningBid = winningBid;
    await auction.save();

    getIO().to(auctionId).emit('auctionEnded', { auctionId, winner, winningBid });

    res.json({ success: true, auction });
  } catch (err) {
    next(err);
  }
};

export const getAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId)
      .populate('createdBy', 'username email')
      .populate('participants', 'username email')
      .populate('winner', 'username email');
    if (!auction) return next(new ApiError('Auction not found', 404));
    res.json({ success: true, auction });
  } catch (err) {
    next(err);
  }
};

export const getAllAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find({})
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, auctions });
  } catch (err) {
    next(err);
  }
}; 