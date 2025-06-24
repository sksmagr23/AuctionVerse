import Auction from '../models/Auction.js';
import { getIO } from '../config/socket.js';

export function auctionStatusUpdater() {
  const updateAuctionStatuses = async () => {
    try {
      const now = new Date();
      const result = await Auction.updateMany(
        { startTime: { $lte: now }, status: 'upcoming' },
        { $set: { status: 'active' } }
      );
      if (result.modifiedCount > 0) {
        getIO().emit('auctionsUpdated');
      }
    } catch (error) {
      console.error('Error updating auction statuses:', error);
    }
  };

  setInterval(updateAuctionStatuses, 30000);
  updateAuctionStatuses();
} 