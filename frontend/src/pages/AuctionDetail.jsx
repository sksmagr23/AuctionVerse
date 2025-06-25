import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import auctionService from '../services/auction.service';
import bidService from '../services/bid.service';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatToIST } from '../utils/formatDate';

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
  const statusColor = {
    upcoming: 'bg-yellow-500',
    active: 'bg-green-500',
    ended: 'bg-red-500',
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4">
            <img
              className="w-full object-cover rounded-lg"
              src={auction.itemImage || '/auction.png'}
              alt={auction.title}
            />
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800">{auction.title}</h1>
                  {socket && auction.status === 'active' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live</span>
                    </div>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${
                    statusColor[auction.status] || 'bg-gray-500'
                  }`}
                >
                  {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                Hosted by{' '}{auction.createdBy.username}
              </p>
              <p className="text-gray-700 mt-4 text-lg">{auction.description}</p>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Auction starts on</p>
                    <p className="text-lg font-semibold">{formatToIST(auction.startTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Participants</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {auction.participants?.length || 0}
                    </p>
                  </div>
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
                <div className="bg-gray-100 p-6 rounded-lg text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Auction Ended</h3>
                  {auction.winner ? (
                    <>
                      <p className="mt-2 text-lg">
                        Winner:{' '}
                        <span className="font-semibold text-green-600">{auction.winner.username}</span>
                      </p>
                      <p className="mt-1 text-lg">
                        Winning Bid:{' '}
                        <span className="font-semibold text-green-600">${auction.winningBid.toLocaleString()}</span>
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-lg text-gray-600">No bids were placed.</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Current Price:</span>
                    <span className="text-4xl font-bold text-green-600">
                      ${auction.currentPrice.toLocaleString()}
                    </span>
                  </div>

                  {isAuthenticated && auction.status === 'active' && !isOwner && (
                    <form onSubmit={handleBidSubmit}>
                      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                      <div className="flex items-center">
                        <span className="text-xl mr-2">$</span>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border rounded-l-md text-lg"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={auction.currentPrice + 1}
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-md text-lg"
                        >
                          Place Bid
                        </button>
                      </div>
                    </form>
                  )}
                  {isOwner && auction.status === 'active' && (
                    <button
                      onClick={handleEndAuction}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded mt-4"
                    >
                      End Auction Now
                    </button>
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