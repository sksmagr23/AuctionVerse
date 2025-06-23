import Auction from '../models/Auction.js';
import { uploadImage } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../config/socket.js';

export const createAuction = async (req, res, next) => {
  try {
    const { title, description, startingPrice, startTime, endTime } = req.body;
    let itemImage = null;

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
      endTime,
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

export const getAuction = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId)
      .populate('createdBy', 'username email')
      .populate('participants', 'username email');
    if (!auction) return next(new ApiError('Auction not found', 404));
    res.json({ success: true, auction });
  } catch (err) {
    next(err);
  }
}; 