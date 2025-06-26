import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auctionService from '../services/auction.service';
import bidService from '../services/bid.service';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Button from '../components/Button';
import { FaCrown, FaGavel } from 'react-icons/fa';

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
    const timer = setTimeout(onEnd, 1200);
    return () => clearTimeout(timer);
  }, [onEnd]);
  return (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="animate-bounce bg-[#FCA311] text-[#14213D] px-6 py-3 rounded-full shadow-lg text-2xl font-extrabold border-4 border-white flex items-center gap-2">
        <FaGavel className="text-2xl" />
        +${amount}
        <span className="text-base font-bold ml-2">({username})</span>
      </div>
    </div>
  );
};

const Lobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [auction, setAuction] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [bidAnim, setBidAnim] = useState(null);
  const auctionEndedRef = useRef(false);
  const [redirecting, setRedirecting] = useState(false);

  const showNotification = (message, type = 'info') => {
    const newNotification = { message, type, id: Date.now() };
    setNotifications(prev => [newNotification, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 3000);
  };

  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        const auctionRes = await auctionService.getAuction(id);
        const participantsRes = await auctionService.getRegisteredParticipants(id);
        setAuction(auctionRes.data.auction);
        setParticipants(participantsRes.data.participants);
        setBidAmount(auctionRes.data.auction.currentPrice + 1);
      } catch {
        setError('Could not load lobby data.');
      }
    };
    fetchLobbyData();

    if (socket) {
      socket.emit('joinLobby', { auctionId: id, userId: user._id });

      const handleUserJoined = (data) => {
        if (data.userId !== user._id) {
          showNotification(`${data.username} has joined the lobby`, 'success');
        }
      };
      const handleUserLeft = (data) => {
        showNotification(`${data.username} has left the lobby`, 'error');
      };
      const handleBidPlaced = (data) => {
        if (data.bid.auction === id) {
          showNotification(`New bid of $${data.currentPrice} placed!`, 'info');
          setAuction(prev => ({ ...prev, currentPrice: data.currentPrice }));
          setBidAmount(data.currentPrice + 1);
          setBidAnim({ amount: data.bid.amount, username: data.username });
        }
      };
      const handleAuctionEnded = () => {
        if (!auctionEndedRef.current) {
          auctionEndedRef.current = true;
          showNotification('Auction has ended!', 'error');
          setRedirecting(true);
          setTimeout(() => navigate(`/auction/${id}`), 2000);
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
  }, [id, socket, user, navigate]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      await bidService.placeBid(id, bidAmount);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Bid failed.');
    }
  };

  const handleEndAuction = async () => {
    if (window.confirm('Are you sure you want to end this auction?')) {
      try {
        await auctionService.endAuction(id);
        navigate(`/auction/${id}`);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not end auction.');
      }
    }
  };

  if (!auction) return <div>Loading...</div>;
  if (redirecting) return <div className="text-center text-lg mt-8">Auction ended. Redirecting...</div>;

  const RADIUS = 180;
  const centerX = 220;
  const centerY = 220;
  const angleStep = (2 * Math.PI) / Math.max(participants.length, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#14213D] to-[#222] text-white flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 space-y-2 z-50">
        {notifications.map(n => (
          <div key={n.id} className="bg-white text-black p-3 rounded-lg shadow-lg animate-fade-in-down">
            {n.message}
          </div>
        ))}
      </div>
      {bidAnim && (
        <BidAnimation amount={bidAnim.amount} username={bidAnim.username} onEnd={() => setBidAnim(null)} />
      )}
      <div className="w-full max-w-4xl bg-[#000]/40 rounded-2xl shadow-lg border-2 border-[#FCA311]/50 p-8 flex flex-col items-center relative">
        <h1 className="text-3xl font-bold text-[#FCA311] mb-2">{auction.title}</h1>
        <div className="relative w-[440px] h-[440px] mx-auto my-6">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <img src={auction.itemImage || '/auction.png'} alt={auction.title} className="h-28 w-28 rounded-full border-4 border-[#FCA311] shadow-lg mb-2" />
            <div className="text-4xl font-bold bg-[#FCA311] text-[#14213D] px-6 py-2 rounded-full border-4 border-white shadow">${auction.currentPrice.toLocaleString()}</div>
            <div className="text-sm text-gray-300 mt-1">Current Price</div>
          </div>
          {participants.map((p, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + RADIUS * Math.cos(angle);
            const y = centerY + RADIUS * Math.sin(angle);
            const isCreator = auction.createdBy._id === p._id;
            const isMe = user._id === p._id;
            return (
              <div
                key={p._id}
                className={`absolute flex flex-col items-center transition-all duration-300 ${isMe ? 'z-20 scale-110' : 'z-0'}`}
                style={{ left: x, top: y }}
              >
                <div className="relative">
                  <img
                    src={p.profilePicture || '/avatar.png'}
                    alt={p.username}
                    className={`h-16 w-16 rounded-full border-4 ${isMe ? 'border-[#FCA311]' : 'border-white'} shadow-lg bg-white`}
                    style={{ background: getAvatarColor(p.username) }}
                  />
                  {isCreator && (
                    <span className="absolute -top-3 -right-3 bg-yellow-400 text-white rounded-full p-1 shadow-lg">
                      <FaCrown className="text-lg" title="Auction Creator" />
                    </span>
                  )}
                </div>
                <div className={`mt-1 text-xs font-bold ${isMe ? 'text-[#FCA311]' : 'text-white'}`}>{p.username}{isMe && ' (You)'}</div>
              </div>
            );
          })}
        </div>
        {auction.status === 'active' && (
          <div className="mt-4 flex flex-col items-center gap-2">
            {auction.createdBy._id === user._id ? (
              <Button onClick={handleEndAuction} variant="warning" className="text-lg px-8 py-3">
                <FaGavel className="inline-block mr-2" /> End Auction Now
              </Button>
            ) : (
              <form onSubmit={handleBidSubmit} className="flex flex-col items-center gap-2">
                {error && <p className="text-red-400">{error}</p>}
                <div className="flex items-center">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-48 text-white text-center text-xl p-2 rounded-l-lg border-2 border-[#FCA311] focus:outline-none"
                  />
                  <Button type="submit" variant="primary" className="rounded-r-lg px-6 py-2 text-lg">
                    Place Bid
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby; 