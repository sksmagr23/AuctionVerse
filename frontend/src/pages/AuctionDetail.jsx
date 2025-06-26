import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import auctionService from '../services/auction.service';
import bidService from '../services/bid.service';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatToIST } from '../utils/formatDate';
import Button from '../components/Button';
import { FaBolt, FaClock, FaFlagCheckered, FaUser, FaUsers } from 'react-icons/fa';

const statusMap = {
  upcoming: {
    color: 'bg-yellow-500 text-white',
    icon: <FaClock className="inline-block mr-1 text-yellow-100" />, label: 'Upcoming',
  },
  active: {
    color: 'bg-green-500 text-white',
    icon: <FaBolt className="inline-block mr-1 text-green-100 animate-pulse" />, label: 'Live',
  },
  ended: {
    color: 'bg-red-500 text-white',
    icon: <FaFlagCheckered className="inline-block mr-1 text-red-100" />, label: 'Ended',
  },
};

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [updateNotification, setUpdateNotification] = useState('');
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionService.getAuction(id);
      if (response.data.success) {
        setAuction(response.data.auction);
        setBidAmount(response.data.auction.currentPrice + 1);
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
    fetchAuction();

    if (socket) {
      socket.emit('joinAuction', id);
      
      socket.on('bidPlaced', (data) => {
        if (data.bid.auction === id) {
          showUpdateNotification('💰 New bid placed!');
          setAuction((prev) => ({
            ...prev,
            currentPrice: data.currentPrice,
          }));
          setBidAmount(data.currentPrice + 1);
        }
      });
      socket.on('auctionEnded', (data) => {
        if (data.auctionId === id) {
          showUpdateNotification('🏁 Auction ended!');
          fetchAuction();
        }
      });
      socket.on('auctionStarted', (data) => {
        if (data.auctionId === id) {
          showUpdateNotification('🚀 Auction started!');
          setAuction((prev) => ({
            ...prev,
            status: 'active',
          }));
        }
      });
      socket.on('userJoined', (data) => {
        if (data.auctionId === id) {
          showUpdateNotification(`👤 ${data.username} joined the auction`);
          setAuction((prev) => ({
            ...prev,
            participants: [...(prev.participants || []), { _id: data.userId, username: data.username }]
          }));
        }
      });

      return () => {
        socket.off('bidPlaced');
        socket.off('auctionEnded');
        socket.off('auctionStarted');
        socket.off('userJoined');
      };
    }
  }, [id, socket]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await bidService.placeBid(id, bidAmount);
      setError('');
      showUpdateNotification('✅ Bid placed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place bid.');
    }
  };

  const handleEndAuction = async () => {
    if (window.confirm('Are you sure you want to end this auction?')) {
      try {
        await auctionService.endAuction(id);
        showUpdateNotification('🏁 Auction ended successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Could not end auction.');
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading auction details...</div>;
  if (error && !auction) return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!auction) return <p className="text-center mt-8">Auction not found.</p>;

  const isOwner = user && user._id === auction.createdBy._id;
  const status = statusMap[auction.status] || { color: 'bg-gray-500', icon: null, label: auction.status };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white shadow-2xl rounded-2xl border-2 border-[#FCA311] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 flex flex-col gap-4 justify-center items-center bg-gradient-to-br from-[#fffbe6] to-[#f3f4f6]">
            <img
              className="w-full max-w-xs object-cover rounded-xl border-2 border-[#FCA311] shadow"
              src={auction.itemImage || '/auction.png'}
              alt={auction.title}
            />
            <div className="flex gap-2 mt-2">
              <span className={`px-3 py-1 text-sm font-bold flex items-center rounded-full shadow ${status.color}`}>
                {status.icon}{status.label}
              </span>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#14213D] mb-1">{auction.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaUser className="text-[#FCA311]" />
                <span>Hosted by <span className="font-semibold text-[#FCA311]">{auction.createdBy.username}</span></span>
              </div>
              <p className="text-gray-700 mb-4 text-lg">{auction.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Auction starts on</div>
                  <div className="text-lg font-semibold">{formatToIST(auction.startTime)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1"><FaUsers className="inline-block mr-1" />Participants</div>
                  <div className="text-lg font-semibold text-blue-600">{auction.participants?.length || 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              {updateNotification && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 animate-pulse">
                  {updateNotification}
                </div>
              )}
              {auction.status === 'ended' ? (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg text-center border-2 border-red-200">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2"><FaFlagCheckered className="text-red-500" /> Auction Ended</h3>
                  {auction.winner ? (
                    <>
                      <p className="mt-2 text-lg">
                        Winner: <span className="font-semibold text-green-600">{auction.winner.username}</span>
                      </p>
                      <p className="mt-1 text-lg">
                        Winning Bid: <span className="font-semibold text-green-600">${auction.winningBid.toLocaleString()}</span>
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-lg text-gray-600">No bids were placed.</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-[#FCA311]/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Current Price:</span>
                    <span className="text-4xl font-bold text-green-600">
                      ${auction.currentPrice.toLocaleString()}
                    </span>
                  </div>
                  {isAuthenticated && auction.status === 'active' && !isOwner && (
                    <form onSubmit={handleBidSubmit} className="flex flex-col gap-2">
                      {error && <p className="bg-red-100 border border-red-300 text-red-700 text-sm rounded px-4 py-2 mb-2">{error}</p>}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">$</span>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-l-lg text-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={auction.currentPrice + 1}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          className="rounded-r-lg text-lg px-6 py-3"
                        >
                          Place Bid
                        </Button>
                      </div>
                    </form>
                  )}
                  {isOwner && auction.status === 'active' && (
                    <Button
                      onClick={handleEndAuction}
                      variant="warning"
                      className="w-full mt-4 text-lg py-3"
                    >
                      End Auction Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail; 