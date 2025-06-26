import React from 'react';
import { Link } from 'react-router-dom';
import { formatToIST } from '../utils/formatDate';
import { FaBolt, FaClock, FaFlagCheckered } from 'react-icons/fa';

const AuctionCard = ({ auction }) => {
  const statusMap = {
    upcoming: {
      color: 'bg-yellow-500',
      icon: <FaClock className="inline-block mr-1 text-yellow-100" />,
      label: 'Upcoming',
    },
    active: {
      color: 'bg-green-500',
      icon: <FaBolt className="inline-block mr-1 text-green-100 animate-pulse" />,
      label: 'Live',
    },
    ended: {
      color: 'bg-red-500 text-white',
      icon: <FaFlagCheckered className="inline-block mr-1 text-red-100" />,
      label: 'Ended',
    },
  };
  const status = statusMap[auction.status] || {
    color: 'bg-gray-500',
    icon: null,
    label: auction.status,
  };
  
  return (
    <div className="bg-gradient-to-br from-[#fffbe6] to-[#f3f4f6] border-2 border-[#FCA311] rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out group">
      <Link to={`/auction/${auction._id}`} className="block focus:outline-none focus:ring-2 focus:ring-[#FCA311]">
        <div className="relative">
          <img
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            src={auction.itemImage || '/auction.png'}
            alt={auction.title}
          />
          <div
            className={`absolute top-2 right-2 px-3 py-1 text-xs font-bold flex items-center rounded-full shadow ${status.color}`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-extrabold text-[#14213D] truncate mb-1">{auction.title}</h3>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
          <p className="text-xs text-gray-500 mb-2">
            by <span className="font-semibold text-[#FCA311]">{auction.createdBy?.username || 'Unknown'}</span>
          </p>
            <span>{formatToIST(auction.startTime)}</span>
          </div>
          <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-200">
            <div>
              <span className="block text-[11px] text-gray-500">Base Price</span>
              <span className="text-lg font-bold text-green-700">${auction.basePrice.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="block text-[11px] text-gray-500">Current</span>
              <span className="text-lg font-bold text-green-700">${auction.currentPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AuctionCard; 