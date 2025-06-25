import Auction from '../models/Auction.js';
import { uploadImage } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import mongoose from 'mongoose';

export const createAuction = async (req, res, next) => {
  try {
    const { title, description, startingPrice, startTime } = req.body;

    if (new Date(startTime) <= new Date()) {
      return next(new ApiError(400, 'Start time must be in the future.'));
    }

    let itemImage = null;

    const start = new Date(startTime);
    const oneHour = 60 * 60 * 1000;
    
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const conflict = await Auction.findOne({
      createdBy: userId,
      startTime: { $lte: new Date(start.getTime() + oneHour), $gte: new Date(start.getTime() - oneHour) }
    });
    
    if (conflict) {
      return next(new ApiError(400, 'You must have at least a 1-hour gap between your auctions.'));
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
      createdBy: userId,
      participants: [userId],
    });

    getIO().emit('auctionCreated', auction);

    const now = new Date();
    const timeDiff = Math.abs(start.getTime() - now.getTime());
    const oneMinute = 60 * 1000;
    
    if (timeDiff <= oneMinute) {
      auction.status = 'active';
      await auction.save();
      getIO().emit('auctionStarted', {
        auctionId: auction._id,
        auction: { ...auction.toObject(), status: 'active' }
      });
    }

    res.status(201).json({ success: true, auction });
  } catch (err) {
    next(err);
  }
};

export const joinAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) return next(new ApiError(404, 'Auction not found'));

    if (!auction.participants.includes(req.user._id)) {
      auction.participants.push(req.user._id);
      await auction.save();
      
      getIO().to(auctionId).emit('userJoined', { 
        userId: req.user._id, 
        username: req.user.username,
        auctionId,
        participantCount: auction.participants.length
      });
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
    if (!auction) return next(new ApiError(404, 'Auction not found'));
    if (!auction.createdBy.equals(req.user._id)) return next(new ApiError(403, 'Only the creator can end this auction'));
    if (auction.status === 'ended') return next(new ApiError(400, 'Auction already ended'));

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
    if (!auction) return next(new ApiError(404, 'Auction not found'));
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