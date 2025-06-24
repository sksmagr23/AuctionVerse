import React from 'react';
import { Link } from 'react-router-dom';

const AuctionCard = ({ auction }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <Link to={`/auction/${auction._id}`}>
        <img
          className="w-full h-48 object-cover"
          src={auction.itemImage || 'https://via.placeholder.com/400x300'}
          alt={auction.title}
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{auction.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Created by {auction.createdBy?.username || 'Unknown'}</p>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Current Price</p>
              <p className="text-lg font-bold text-green-600">${auction.currentPrice.toLocaleString()}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
                auction.status === 'active' ? 'bg-green-500' :
                auction.status === 'upcoming' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            >
              {auction.status}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AuctionCard; 