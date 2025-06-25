import React, { useState, useEffect } from 'react';
import auctionService from '../services/auction.service';
import AuctionCard from '../components/AuctionCard';
import { useSocket } from '../contexts/SocketContext';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateNotification, setUpdateNotification] = useState('');
  const socket = useSocket();

  const fetchAuctions = async () => {
    try {
      const response = await auctionService.getAllAuctions();
      if (response.data.success) {
        setAuctions(response.data.auctions);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const showUpdateNotification = (message) => {
    setUpdateNotification(message);
    setTimeout(() => setUpdateNotification(''), 3000);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('auctionsUpdated', () => {
      console.log('Auctions updated, refreshing list...');
      showUpdateNotification('🔄 Auctions updated');
      fetchAuctions();
    });
    socket.on('auctionCreated', (newAuction) => {
      console.log('New auction created:', newAuction);
      showUpdateNotification('🆕 New auction created');
      setAuctions(prev => [newAuction, ...prev]);
    });
    socket.on('auctionStarted', (data) => {
      console.log('Auction started:', data);
      showUpdateNotification('🚀 Auction started');
      setAuctions(prev => 
        prev.map(auction => 
          auction._id === data.auctionId 
            ? { ...auction, status: 'active' }
            : auction
        )
      );
    });
    socket.on('auctionEnded', (data) => {
      console.log('Auction ended:', data);
      showUpdateNotification('🏁 Auction ended');
      setAuctions(prev => 
        prev.map(auction => 
          auction._id === data.auctionId 
            ? { ...auction, status: 'ended', winner: data.winner, winningBid: data.winningBid }
            : auction
        )
      );
    });
    socket.on('bidPlaced', (data) => {
      console.log('Bid placed:', data);
      showUpdateNotification('💰 New bid placed');
      setAuctions(prev => 
        prev.map(auction => 
          auction._id === data.bid.auction 
            ? { ...auction, currentPrice: data.currentPrice }
            : auction
        )
      );
    });

    return () => {
      socket.off('auctionsUpdated');
      socket.off('auctionCreated');
      socket.off('auctionStarted');
      socket.off('auctionEnded');
      socket.off('bidPlaced');
    };
  }, [socket]);

  if (loading) return <p>Loading auctions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Live Auctions</h1>
          {socket && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          )}
        </div>
        {updateNotification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded animate-pulse">
            {updateNotification}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <AuctionCard key={auction._id} auction={auction} />
        ))}
      </div>
    </div>
  );
};

export default Home; 