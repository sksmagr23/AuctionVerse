import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import auctionService from '../services/auction.service';
import bidService from '../services/bid.service';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const { isAuthenticated } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    const fetchAuction = async () => {
      try {
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
    fetchAuction();

    if (socket) {
      socket.emit('joinAuction', id);

      socket.on('bidPlaced', (data) => {
        if (data.bid.auction === id) {
          setAuction((prevAuction) => ({
            ...prevAuction,
            currentPrice: data.currentPrice,
          }));
        }
      });

      return () => {
        socket.off('bidPlaced');
      };
    }
  }, [id, socket]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await bidService.placeBid(id, bidAmount);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place bid.');
    }
  };

  if (loading) return <p>Loading auction details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!auction) return <p>Auction not found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          className="w-full h-auto rounded-lg shadow-lg"
          src={auction.itemImage || 'https://via.placeholder.com/800x600'}
          alt={auction.title}
        />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">{auction.title}</h1>
        <p className="text-gray-600 mb-4">Created by {auction.createdBy?.username}</p>
        <p className="text-gray-800 mb-6">{auction.description}</p>
        
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Current Price:</span>
            <span className="text-3xl font-bold text-green-600">${auction.currentPrice.toLocaleString()}</span>
          </div>
          
          {isAuthenticated && auction.status === 'upcoming' && (
            <form onSubmit={handleBidSubmit}>
              <div className="flex items-center">
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-l-md"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={auction.currentPrice + 1}
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md"
                >
                  Place Bid
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuctionDetail; 