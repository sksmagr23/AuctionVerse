import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import authService from '../services/auth.service';

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
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          {socket && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">Live</span>
            </div>
          )}
        </div>
        {isUpdating && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">Updating...</span>
          </div>
        )}
      </div>

      {updateNotification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 animate-pulse">
          {updateNotification}
        </div>
      )}

      <div className="flex items-center space-x-6 mb-6">
        <img
          src={user.profilePicture || '/avatar.png'}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-3xl font-bold">{user.username}</h2>
          <p className="text-gray-600 text-lg">{user.email}</p>
          <p className="text-sm text-gray-500 mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          🏆 Auctions Won
          {user.wonAuctions && user.wonAuctions.length > 0 && (
            <span className="ml-2 bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {user.wonAuctions.length}
            </span>
          )}
        </h3>
        
        {user.wonAuctions && user.wonAuctions.length > 0 ? (
          <div className="space-y-3">
            {user.wonAuctions.map((won, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <Link 
                      to={`/auction/${won.auction}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      Auction #{won.auction}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Won for ${won.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">
                      ${won.amount.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Winning Bid</div>
                  </div>
                </div>
              </div>
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {user.wonAuctions ? user.wonAuctions.length : 0}
          </div>
          <div className="text-sm text-blue-600">Auctions Won</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            ${user.wonAuctions ? user.wonAuctions.reduce((total, won) => total + won.amount, 0).toLocaleString() : '0'}
          </div>
          <div className="text-sm text-green-600">Total Spent</div>
        </div>
      </div>

      {user.activeAuctions && user.activeAuctions.length > 0 && (
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            🎯 Active Auctions
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {user.activeAuctions.length}
            </span>
          </h3>
          <div className="space-y-3">
            {user.activeAuctions.map((auction, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <Link 
                      to={`/auction/${auction._id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      {auction.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: <span className={`font-medium ${
                        auction.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">
                      ${auction.currentPrice.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Current Price</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.createdAuctions && user.createdAuctions.length > 0 && (
        <div className="bg-purple-50 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            🎨 Created Auctions
            <span className="ml-2 bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {user.createdAuctions.length}
            </span>
          </h3>
          <div className="space-y-3">
            {user.createdAuctions.map((auction, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <Link 
                      to={`/auction/${auction._id}`} 
                      className="text-purple-600 hover:text-purple-800 font-medium hover:underline"
                    >
                      {auction.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: <span className={`font-medium ${
                        auction.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">
                      ${auction.currentPrice.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Current Price</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 