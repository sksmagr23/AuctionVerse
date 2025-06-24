import React from 'react';
import { Link } from 'react-router-dom';
import { formatToIST } from '../utils/formatDate';

const AuctionCard = ({ auction }) => {
  const statusColor = {
    upcoming: 'bg-yellow-500',
    active: 'bg-green-500',
    ended: 'bg-red-500',
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out">
      <Link to={`/auction/${auction._id}`}>
        <div className="relative">
          <img
            className="w-full h-56 object-cover"
            src={auction.itemImage || '/auction.png'}
            alt={auction.title}
          />
          <div
            className={`absolute top-2 right-2 px-3 py-1 text-sm font-semibold text-white rounded-full ${
              statusColor[auction.status] || 'bg-gray-500'
            }`}
          >
            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-900 truncate">{auction.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            by {auction.createdBy?.username || 'Unknown'}
          </p>
          <div className="mt-4">
            <p className="text-xs text-gray-600">Starts On</p>
            <p className="text-sm font-semibold text-gray-800">{formatToIST(auction.startTime)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-600">Starting Price</p>
              <p className="text-xl font-bold text-green-700">
                ${auction.startingPrice.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Current Price</p>
              <p className="text-xl font-bold text-green-700">
                ${auction.currentPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AuctionCard; 