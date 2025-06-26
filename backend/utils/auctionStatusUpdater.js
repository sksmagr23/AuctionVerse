import Auction from '../models/Auction.js';
import { getIO } from '../config/socket.js';

export function auctionStatusUpdater() {
  const updateAuctionStatuses = async () => {
    try {
      const now = new Date();
      
      const auctionsToStart = await Auction.find({
        startTime: { $lte: now },
        status: 'upcoming'
      }).populate('createdBy', 'username');

      if (auctionsToStart.length > 0) {
        await Auction.updateMany(
          { _id: { $in: auctionsToStart.map(a => a._id) } },
          { $set: { status: 'active' } }
        );
        auctionsToStart.forEach(auction => {
          getIO().emit('auctionStarted', {
            auctionId: auction._id,
            auction: { ...auction.toObject(), status: 'active' }
          });
        });

        getIO().emit('auctionsUpdated');
      }
      
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const auctionsToEnd = await Auction.find({
        status: 'active',
        startTime: { $lte: dayAgo },
        $expr: { $eq: ['$currentPrice', '$basePrice'] }
      });

      if (auctionsToEnd.length > 0) {
        await Auction.updateMany(
          { _id: { $in: auctionsToEnd.map(a => a._id) } },
          { $set: { status: 'ended' } }
        );

        auctionsToEnd.forEach(auction => {
          getIO().emit('auctionEnded', {
            auctionId: auction._id,
            winner: null,
            winningBid: null
          });
        });

        getIO().emit('auctionsUpdated');
      }

    } catch (error) {
      console.error('Error updating auction statuses:', error);
    }
  };
  
  setInterval(updateAuctionStatuses, 5000);
  
  updateAuctionStatuses();
} 