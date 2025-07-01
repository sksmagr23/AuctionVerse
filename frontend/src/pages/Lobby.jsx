import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import auctionService from '../services/auction.service';
import bidService from '../services/bid.service';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useSnackbar } from 'notistack';
import { 
  FaCrown, 
  FaGavel, 
  FaArrowLeft, 
  FaRupeeSign,
  FaUser,
  FaUsers,
  FaHistory,
  FaFlagCheckered
} from 'react-icons/fa';

const getAvatarColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
};

const BidAnimation = ({ amount, username, onEnd }) => {
  useEffect(() => {
    const timer = setTimeout(onEnd, 1500);
    return () => clearTimeout(timer);
  }, [onEnd]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-bounce bg-[#FCA311] text-[#14213D] px-6 py-3 rounded-sm border-2 border-black shadow-[5px_5px_0px_#000] text-2xl font-extrabold flex items-center gap-2">
        <FaGavel className="text-xl" />
        <FaRupeeSign className="text-lg" />{Number(amount).toLocaleString()}
        <span className="text-base font-bold ml-2 hidden sm:inline-block">by {username}</span>
      </div>
    </div>
  );
};

const Lobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const [auction, setAuction] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidAnim, setBidAnim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidHistory, setBidHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const auctionEndedRef = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  const showNotification = (message, variant, icon) => {
    enqueueSnackbar(
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{message}</span>
      </div>,
      {
        variant,
        preventDuplicate: true,
        autoHideDuration: 3000
      }
    );
  };

  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        setLoading(true);
        const auctionRes = await auctionService.getAuction(id);
        const participantsRes = await auctionService.getRegisteredParticipants(id);
        
        setAuction(auctionRes.data.auction);
        setParticipants(participantsRes.data.participants);
        
        try {
          const bidsRes = await bidService.getBidsByAuction(id);
          setBidHistory(bidsRes.data.bids || []);
        } catch (err) {
          console.error("Failed to load bid history:", err);
        }
        
        setBidAmount(auctionRes.data.auction.currentPrice + 1);
      } catch {
        showNotification(
          'Failed to load auction data',
          'error',
          <FaFlagCheckered className="text-red-500" />
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchLobbyData();

    if (socket) {
      socket.emit('joinLobby', { auctionId: id, userId: user._id });

      const handleUserJoined = (data) => {
        if (data.userId !== user._id) {
          showNotification(
            `${data.username} joined the auction`,
            'success',
            <FaUser className="text-green-500" />
          );
          setParticipants(prev => {
            if (!prev.find(p => p._id === data.userId)) {
              return [...prev, { _id: data.userId, username: data.username }];
            }
            return prev;
          });
        }
      };
      
      const handleUserLeft = (data) => {
        showNotification(
          `${data.username} left the auction`,
          'warning',
          <FaUser className="text-orange-500" />
        );
      };
      
      const handleBidPlaced = (data) => {
        if (data.bid.auction === id) {
          showNotification(
            `New bid: ₹${data.currentPrice.toLocaleString()}`,
            'info',
            <FaRupeeSign className="text-blue-500" />
          );
          setAuction(prev => ({ ...prev, currentPrice: data.currentPrice }));
          setBidAmount(data.currentPrice + 1);
          setBidAnim({ amount: data.currentPrice, username: data.username });
          
          setBidHistory(prev => [data.bid, ...prev]);
        }
      };
      
      const handleAuctionEnded = () => {
        if (!auctionEndedRef.current) {
          auctionEndedRef.current = true;
          showNotification(
            'Auction has ended!',
            'warning',
            <FaFlagCheckered className="text-red-500" />
          );
          setRedirecting(true);
          setTimeout(() => navigate(`/auction/${id}`), 3000);
        }
      };

      socket.on('userJoinedLobby', handleUserJoined);
      socket.on('userLeftLobby', handleUserLeft);
      socket.on('bidPlaced', handleBidPlaced);
      socket.on('auctionEnded', handleAuctionEnded);

      return () => {
        socket.emit('leaveLobby', { auctionId: id, userId: user._id });
        socket.off('userJoinedLobby', handleUserJoined);
        socket.off('userLeftLobby', handleUserLeft);
        socket.off('bidPlaced', handleBidPlaced);
        socket.off('auctionEnded', handleAuctionEnded);
      };
    }
  }, [id, socket, user, navigate, enqueueSnackbar]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (Number(bidAmount) <= (auction?.currentPrice || 0)) {
      showNotification(
        'Bid must be higher than current price',
        'error',
        <FaGavel className="text-red-500" />
      );
      return;
    }
    
    try {
      await bidService.placeBid(id, bidAmount);
      showNotification(
        `Your bid of ₹${Number(bidAmount).toLocaleString()} was placed!`,
        'success',
        <FaGavel className="text-green-500" />
      );
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Bid failed.';
      showNotification(
        errorMsg,
        'error',
        <FaGavel className="text-red-500" />
      );
    }
  };

  const handleEndAuction = async () => {
    if (window.confirm('Are you sure you want to end this auction?')) {
      try {
        await auctionService.endAuction(id);
        showNotification(
          'Auction ended successfully',
          'success',
          <FaFlagCheckered className="text-green-500" />
        );
        navigate(`/auction/${id}`);
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Could not end auction.';
        showNotification(
          errorMsg,
          'error',
          <FaFlagCheckered className="text-red-500" />
        );
      }
    }
  };
  
  const incrementBid = () => {
    const currentBid = Number(bidAmount);
    setBidAmount(currentBid + 1);
  };
  
  const decrementBid = () => {
    const currentBid = Number(bidAmount);
    const minBid = auction?.currentPrice + 1 || 1;
    if (currentBid > minBid) {
      setBidAmount(currentBid - 1);
    }
  };

  if (loading) return <Loader message="Joining auction lobby..." />;
  
  if (redirecting) return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213D] to-[#222] flex items-center justify-center">
      <div className="bg-white p-6 rounded-sm border-2 border-[#000] shadow-[8px_8px_0px_#000] max-w-md w-full text-center">
        <FaFlagCheckered className="text-5xl text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#14213D] mb-2">Auction Ended</h1>
        <p className="text-gray-600 mb-4">Redirecting to auction page...</p>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-[#FCA311] h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
        </div>
      </div>
    </div>
  );
  
  if (!auction) return <Loader message="Loading auction data..." />;

  const isCreator = auction.createdBy._id === user._id;
  const currentUserParticipant = participants.find(p => p._id === user._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213D] to-[#222] py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to={`/auction/${id}`}>
            <Button variant="secondary" icon={<FaArrowLeft />}>
              Back to Auction
            </Button>
          </Link>
          
          <div className="flex items-center">
            <Button 
              onClick={() => setShowHistory(!showHistory)} 
              variant="nav" 
              icon={<FaHistory />}
            >
              {showHistory ? 'Hide History' : 'Bid History'}
            </Button>
          </div>
        </div>
        
        {bidAnim && (
          <BidAnimation amount={bidAnim.amount} username={bidAnim.username} onEnd={() => setBidAnim(null)} />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#000]/40 rounded-sm border-2 border-[#FCA311]/50 shadow-[8px_8px_0px_#000] p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <img 
                    src={auction.itemImage || "/auction.png"} 
                    alt={auction.title} 
                    className="w-full aspect-square object-cover border-2 border-[#FCA311] rounded-sm shadow-md"
                  />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#FCA311] mb-3">{auction.title}</h1>
                  <p className="text-gray-300 mb-6 text-sm">{auction.description}</p>
                  
                  <div className="bg-[#1a1a1a] border border-[#333] p-4 rounded-sm mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Price:</span>
                      <span className="text-2xl md:text-3xl font-bold text-[#FCA311] flex items-center">
                        <FaRupeeSign className="text-xl mr-1" />
                        {auction.currentPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-500">Base Price:</span>
                      <span className="text-gray-300">₹{auction.basePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {auction.status === 'active' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {isCreator ? (
                    <div className="text-center">
                      <p className="text-gray-300 mb-3">As the auction creator, you can end this auction at any time.</p>
                      <Button
                        onClick={handleEndAuction}
                        variant="warning"
                        className="text-lg py-2 px-6"
                        icon={<FaGavel />}
                      >
                        End Auction Now
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleBidSubmit} className="flex flex-col items-center">
                      
                      <div className="flex items-center w-full max-w-md">
                        <div className="flex items-center border-2 border-[#FCA311] rounded-sm overflow-hidden shadow-md">
                          <button
                            type="button"
                            onClick={decrementBid}
                            className="bg-[#222] text-white px-3 py-2 text-xl font-bold hover:bg-[#333] transition"
                          >
                            -
                          </button>
                          
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                              <FaRupeeSign className="text-[#FCA311]" />
                            </div>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="w-full bg-[#111] text-white text-center text-xl py-2 focus:outline-none"
                              min={auction.currentPrice + 1}
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={incrementBid}
                            className="bg-[#222] text-white px-3 py-2 text-xl font-bold hover:bg-[#333] transition"
                          >
                            +
                          </button>
                        </div>
                        
                        <Button
                          type="submit"
                          variant="primary"
                          className="ml-2"
                          icon={<FaGavel />}
                        >
                          Place Bid
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
            
            {showHistory && (
              <div className="bg-[#000]/40 rounded-sm border-2 border-[#FCA311]/50 shadow-[8px_8px_0px_#000] p-6">
                <div className="flex items-center mb-4">
                  <FaHistory className="text-[#FCA311] mr-2" />
                  <h2 className="text-xl font-bold text-white">Bid History</h2>
                </div>
                
                {bidHistory.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {bidHistory.map((bid, index) => (
                      <div 
                        key={bid._id || index}
                        className="flex justify-between items-center p-3 mb-2 bg-[#1a1a1a] border border-[#333] rounded-sm"
                      >
                        <div className="flex items-center">
                          <div 
                            style={{ background: getAvatarColor(bid.bidder?.username || 'User') }}
                            className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                          >
                            {(bid.bidder?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white">{bid.bidder?.username || 'Unknown'}</span>
                        </div>
                        <span className="text-[#FCA311] font-bold flex items-center">
                          <FaRupeeSign className="mr-1 text-xs" />
                          {bid.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FaGavel className="text-4xl mx-auto mb-2 opacity-30" />
                    <p>No bids have been placed yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-[#000]/40 rounded-sm border-2 border-[#FCA311]/50 shadow-[8px_8px_0px_#000] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaUsers className="text-[#FCA311] mr-2" />
                  <h2 className="text-xl font-bold text-white">Participants</h2>
                </div>
                <div className="bg-[#FCA311] text-[#14213D] font-bold px-2 py-0.5 rounded-full text-sm">
                  {participants.length}
                </div>
              </div>
              
              <div className="space-y-3">
                {currentUserParticipant && (
                  <div className="bg-[#FCA311]/20 border-2 border-[#FCA311] rounded-sm p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-[#FCA311] text-[#14213D] font-bold">
                      {currentUserParticipant.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#FCA311]">
                          {currentUserParticipant.username}
                        </span>
                        <span className="text-xs bg-[#FCA311] text-[#14213D] px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {auction.createdBy && auction.createdBy._id !== user._id && (
                  <div className="bg-[#222] border border-yellow-600 rounded-sm p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 relative"
                      style={{ background: getAvatarColor(auction.createdBy.username) }}
                    >
                      {auction.createdBy.username.charAt(0).toUpperCase()}
                      <span className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-md">
                        <FaCrown className="text-xs" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {auction.createdBy.username}
                        </span>
                        <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded-full">
                          Host
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {participants
                  .filter(p => p._id !== user._id && (!auction.createdBy || p._id !== auction.createdBy._id))
                  .map(participant => (
                    <div key={participant._id} className="bg-[#1a1a1a] border border-[#333] rounded-sm p-3 flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold"
                        style={{ background: getAvatarColor(participant.username) }}
                      >
                        {participant.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-white">
                          {participant.username}
                        </span>
                      </div>
                    </div>
                  ))
                }
                
                {participants.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <FaUsers className="text-4xl mx-auto mb-2 opacity-30" />
                    <p>No participants have joined yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;