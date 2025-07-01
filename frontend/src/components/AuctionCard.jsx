import { Link } from 'react-router-dom';
import { formatToIST } from '../utils/formatDate';
import {  
  FaClock, 
  FaFlagCheckered, 
  FaRupeeSign, 
  FaCalendarAlt,
  FaUser,
  FaArrowRight
} from 'react-icons/fa';
import { GoCheckCircleFill } from "react-icons/go";

const AuctionCard = ({ auction }) => {
  const statusMap = {
    upcoming: {
      color: 'bg-gradient-to-r from-[#fca311] to-[#fac311]',
      textColor: 'text-[#14213D]',
      icon: <FaClock className="mr-1.5" />,
      label: 'Upcoming',
    },
    active: {
      color: 'bg-gradient-to-r from-green-600 to-emerald-400',
      textColor: 'text-white',
      icon: <FaFlagCheckered className="mr-1.5 animate-pulse" />,
      label: 'Live',
    },
    ended: {
      color: 'bg-gradient-to-r from-red-600 to-orange-500',
      textColor: 'text-white',
      icon: <GoCheckCircleFill className="mr-1.5" />,
      label: 'Ended',
    },
  };
  
  const status = statusMap[auction.status] || {
    color: 'bg-gradient-to-r from-gray-500 to-gray-400',
    textColor: 'text-white',
    icon: null,
    label: auction.status,
  };
  
  return (
    <div className="group bg-gradient-to-b from-transparent to-white rounded-sm border-2 border-[#000] shadow-[8px_8px_0px_#000] overflow-hidden drop-shadow-md drop-shadow-[#fca311] transition-all duration-300 hover:shadow-[8px_8px_0px_#fca311]">
      <Link to={`/auction/${auction._id}`} className="block focus:outline-none focus:ring-2 focus:ring-[#FCA311]">
        <div className="relative">
          <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold flex items-center rounded-md shadow-md ${status.color} ${status.textColor} z-10`}>
            {status.icon}
            {status.label}
          </div>
          
          <div className="relative overflow-hidden h-48">
            <img
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              src={auction.itemImage || '/auction.png'}
              alt={auction.title}
            />
          </div>
        </div>
        
        <div className="p-4">
          <h1 className="text-xl md:text-2xl font-extrabold text-[#14213D] line-clamp-1 mb-2 group-hover:text-[#EAA311] transition-colors duration-300">
            {auction.title}
          </h1>
          <div className="flex items-center mb-3">
            <FaUser className="text-[#FCA311] mr-1.5 text-xs" />
            <span className="text-sm text-gray-600">
              by <span className="font-semibold text-[#14213D]">{auction.createdBy?.username || 'Unknown'}</span>
            </span>
          </div>
          
          <div className="flex items-center mb-4 text-sm text-gray-800">
            <FaCalendarAlt className="text-[#FCA311] mr-1.5 text-xs" />
            <span>{formatToIST(auction.startTime)}</span>
          </div>
          
          <div className="border-t border-gray-600 my-3"></div>
          
          <div className={`grid ${auction.status === 'upcoming' ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
            <div className="bg-white border border-black p-2">
              <span className="block text-xs text-gray-700 mb-1">Base Price</span>
              <div className="flex items-center text-[#14213D] font-bold">
                <FaRupeeSign className="text-xs mr-1 text-[#FCA311]" />
                <span>{auction.basePrice.toLocaleString()}</span>
              </div>
            </div>
            
            {auction.status !== 'upcoming' && (
              <div className="bg-white border border-black p-2">
                <span className="block text-xs text-gray-700 mb-1">
                  {auction.status === 'ended' ? 'Winning Bid' : 'Current Bid'}
                </span>
                <div className="flex items-center text-green-800 font-bold">
                  
                  <span>
                    {auction.winningBid === null 
                      ? (auction.status === 'ended' ? 'No bids received' : 'No bids yet') 
                      : ( <span className='flex items-center'>
                          <FaRupeeSign className="text-xs mr-1 text-green-800" />{auction.currentPrice.toLocaleString()}
                        </span>
                      )}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-end text-sm font-medium text-[#9f6200] group-hover:text-[#14213D] transition-colors duration-300">
            <span>View Details</span>
            <FaArrowRight className="ml-1.5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AuctionCard;