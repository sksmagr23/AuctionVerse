import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import authService from '../services/auth.service';
import { formatToIST } from '../utils/formatDate';
import { FaTrophy, FaPaintBrush, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';

const CompactAuctionCard = ({ auction, wonAmount }) => {
  const statusColor = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-yellow-100 text-yellow-700',
    ended: 'bg-red-100 text-red-700',
  };
  return (
    <Link to={`/auction/${auction._id || auction.auction?._id || auction.auction}`}
      className="block group border border-gray-200 rounded-lg px-4 py-3 bg-white hover:shadow-lg transition-all">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-semibold text-[#14213D] truncate">
            {auction.title || auction.auction?.title || 'Auction'}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <FaCalendarAlt className="inline-block mr-1 text-[#FCA311]" />
            {formatToIST(auction.startTime || auction.auction?.startTime)}
          </div>
        </div>
        <div className="text-right">
          {wonAmount !== undefined ? (
            <div>
              <span className="font-bold text-green-600 text-lg">${wonAmount.toLocaleString()}</span>
              <div className="text-xs text-gray-500 mt-1">Winning Bid</div>
            </div>
          ) : (
            <>
              <span className="font-bold text-green-600 text-lg">${auction.currentPrice?.toLocaleString?.() || 0}</span>
              <div className="text-xs text-gray-500 mt-1">Current</div>
            </>
          )}
          {auction.status && (
            <div className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[auction.status] || 'bg-gray-100 text-gray-600'}`}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const Profile = () => {
  const { user, login } = useAuth();
  const socket = useSocket();
  const [updateNotification, setUpdateNotification] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const showUpdateNotification = (message) => {
    setUpdateNotification(message);
    setTimeout(() => setUpdateNotification(''), 5000);
  };

  const refreshUserData = async () => {
    try {
      setIsUpdating(true);
      const res = await authService.getUserProfile();
      if (res.data.success) {
        login(res.data.user);
      }
    } catch (err) {
      console.log('Error fetching user data:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAuctionEnded = async (data) => {
      try {
        if (data.winner && data.winner === user?._id) {
          showUpdateNotification('🎉 Congratulations! You won an auction!');
          await refreshUserData();
        } else if (data.winner) {
          showUpdateNotification('🏁 An auction you participated in has ended');
          await refreshUserData();
        } else {
          showUpdateNotification('🏁 An auction has ended with no winner');
          await refreshUserData();
        }
      } catch (err) {
        console.log('Error handling auction ended:', err);
      }
    };

    const handleAuctionCreated = () => {
      showUpdateNotification('🆕 A new auction has been created');
    };

    const handleAuctionStarted = () => {
      showUpdateNotification('🚀 An auction has started');
    };

    const handleBidPlaced = () => {
      showUpdateNotification('💰 A new bid was placed');
    };

    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('auctionCreated', handleAuctionCreated);
    socket.on('auctionStarted', handleAuctionStarted);
    socket.on('bidPlaced', handleBidPlaced);

    return () => {
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('auctionCreated', handleAuctionCreated);
      socket.off('auctionStarted', handleAuctionStarted);
      socket.off('bidPlaced', handleBidPlaced);
    };
  }, [socket, user?._id, login]);

  if (!user) {
    return <p className="text-center mt-8">You must be logged in to view your profile.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-2xl p-8 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex items-center gap-6">
          <img
            src={user.profilePicture || '/avatar.png'}
            alt={user.username}
            className="w-28 h-28 rounded-full object-cover border-4 border-[#FCA311] shadow"
          />
          <div>
            <h2 className="text-3xl font-extrabold text-[#14213D]">{user.username}</h2>
            <p className="text-gray-600 text-lg">{user.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isUpdating && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FCA311]"></div>
            <span className="text-sm text-[#FCA311]">Updating...</span>
          </div>
        )}
      </div>

      {updateNotification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 animate-pulse">
          {updateNotification}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center flex flex-col items-center">
          <FaTrophy className="text-2xl text-blue-500 mb-1" />
          <div className="text-2xl font-bold text-blue-600">
            {user.wonAuctions ? user.wonAuctions.length : 0}
          </div>
          <div className="text-sm text-blue-600">Auctions Won</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center flex flex-col items-center">
          <FaDollarSign className="text-2xl text-green-500 mb-1" />
          <div className="text-2xl font-bold text-green-600">
            ${user.wonAuctions ? user.wonAuctions.reduce((total, won) => total + won.amount, 0).toLocaleString() : '0'}
          </div>
          <div className="text-sm text-green-600">Total Spent</div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" /> Auctions Won
          {user.wonAuctions && user.wonAuctions.length > 0 && (
            <span className="ml-2 bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {user.wonAuctions.length}
            </span>
          )}
        </h3>
        {user.wonAuctions && user.wonAuctions.length > 0 ? (
          <div className="space-y-2">
            {user.wonAuctions.map((won, idx) => (
              <CompactAuctionCard key={idx} auction={won.auction} wonAmount={won.amount} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-500 text-lg">You haven't won any auctions yet.</p>
            <p className="text-gray-400 text-sm mt-2">
              Start bidding on active auctions to win!
            </p>
            <Link 
              to="/" 
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Browse Auctions
            </Link>
          </div>
        )}
      </div>

      {user.createdAuctions && user.createdAuctions.length > 0 && (
        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaPaintBrush className="text-purple-500" /> Created Auctions
            <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {user.createdAuctions.length}
            </span>
          </h3>
          <div className="space-y-2">
            {user.createdAuctions.map((auction, idx) => (
              <CompactAuctionCard key={idx} auction={auction} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 