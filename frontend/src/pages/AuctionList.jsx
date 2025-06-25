import React, { useState, useEffect } from 'react';
import auctionService from '../services/auction.service';
import AuctionCard from '../components/AuctionCard';
import { useSocket } from '../contexts/SocketContext';

const AuctionList = () => {
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
      showUpdateNotification('🔄 Auctions updated');
      fetchAuctions();
    });
    socket.on('auctionCreated', (newAuction) => {
      showUpdateNotification('🆕 New auction created');
      setAuctions(prev => [newAuction, ...prev]);
    });
    socket.on('auctionStarted', (data) => {
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

  const liveAuctions = auctions.filter(a => a.status === 'active');
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const pastAuctions = auctions.filter(a => a.status === 'ended');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Auctions</h1>
        </div>
        {updateNotification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded animate-pulse">
            {updateNotification}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Live Auctions</h2>
        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">No live auctions</div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Upcoming Auctions</h2>
        {upcomingAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">No upcoming auctions</div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-500 mb-4">Past Auctions</h2>
        {pastAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">No past auctions</div>
        )}
      </div>

      {auctions.length === 0 && (
        <div className="text-center text-gray-500 text-lg mt-12">No auctions found.</div>
      )}
    </div>
  );
};

export default AuctionList; 