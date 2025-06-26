import React, { useState, useEffect } from 'react';
import auctionService from '../services/auction.service';
import AuctionCard from '../components/AuctionCard';
import { useSocket } from '../contexts/SocketContext';
import Loader from '../components/Loader';
import { FaBolt, FaClock, FaHistory } from 'react-icons/fa';

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
  
  if (loading) return <Loader message="Loading available auctions..." />;
  if (error) return <p className="text-red-500">{error}</p>;

  const liveAuctions = auctions.filter(a => a.status === 'active');
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const pastAuctions = auctions.filter(a => a.status === 'ended');

  return (
    <div className="bg-[#E5E5E5] min-h-screen pb-8">
      <div className="flex justify-between items-center mb-6 px-4 pt-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-[#14213D]">Auctions</h1>
        </div>
        {updateNotification && (
          <div className="bg-[#FCA311] border border-[#14213D] text-[#14213D] px-4 py-2 rounded shadow animate-pulse font-semibold">
            {updateNotification}
          </div>
        )}
      </div>

      {/* Live Auctions */}
      <div className="mb-10 px-4">
        <div className="flex items-center mb-4">
          <FaBolt className="text-green-600 text-xl mr-2" />
          <h2 className="text-2xl font-semibold text-green-700">Live Auctions</h2>
        </div>
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

      {/* Upcoming Auctions */}
      <div className="mb-10 px-4">
        <div className="flex items-center mb-4">
          <FaClock className="text-yellow-500 text-xl mr-2" />
          <h2 className="text-2xl font-semibold text-yellow-600">Upcoming Auctions</h2>
        </div>
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

      {/* Past Auctions */}
      <div className="mb-10 px-4">
        <div className="flex items-center mb-4">
          <FaHistory className="text-gray-500 text-xl mr-2" />
          <h2 className="text-2xl font-semibold text-gray-500">Past Auctions</h2>
        </div>
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
    </div>
  );
};

export default AuctionList; 