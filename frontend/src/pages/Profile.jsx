import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import authService from '../services/auth.service';
import { formatToIST } from '../utils/formatDate';
import { useSnackbar } from 'notistack';
import Button from '../components/Button';
import Loader from '../components/Loader';
import {
  FaTrophy,
  FaRupeeSign,
  FaCalendarAlt,
  FaGavel,
  FaUser,
  FaHistory,
  FaSync,
  FaTag,
  FaStar
} from 'react-icons/fa';

const CompactAuctionCard = ({ auction, wonAmount }) => {
  const statusColor = {
    active: 'bg-green-100 text-green-700 border-green-300',
    upcoming: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    ended: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <Link
      to={`/auction/${auction._id || auction.auction?._id || auction.auction}`}
      className="block border-2 border-gray-200 rounded-sm px-4 py-3 bg-white hover:shadow-[5px_5px_0px_#fca311] hover:border-[#fca311] transition-all duration-200"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[#14213D] truncate">
            {auction.title || auction.auction?.title || 'Auction'}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <FaCalendarAlt className="text-[#FCA311]" />
            <span>{formatToIST(auction.startTime || auction.auction?.startTime)}</span>
          </div>
        </div>

        <div className="text-right pl-4">
          {wonAmount !== undefined ? (
            <div>
              <span className="font-bold text-green-600 text-lg flex items-center justify-end">
                <FaRupeeSign className="text-sm" />
                {wonAmount.toLocaleString()}
              </span>
              <div className="text-xs text-gray-500 mt-1">Winning Bid</div>
            </div>
          ) : (
            <>
              <span className="font-bold text-[#FCA311] text-lg flex items-center justify-end">
                <FaRupeeSign className="text-sm" />
                {auction.currentPrice?.toLocaleString?.() || auction.basePrice?.toLocaleString?.() || 0}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {auction.status === 'active' ? 'Current Price' : 'Base Price'}
              </div>
            </>
          )}

          {auction.status && (
            <div className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[auction.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const EmptyState = ({ icon, title, message, action }) => (
  <div className="text-center py-4">
    <div className="text-6xl mb-2 text-gray-300">{icon}</div>
    <p className="text-gray-800 font-bold text-lg">{title}</p>
    <p className="text-gray-500 text-sm mt-2 mb-4">{message}</p>
    {action}
  </div>
);

const ProfileSection = ({ title, icon, count, colorClass, children }) => (
  <div className={`bg-white p-4 rounded-sm border-2 border-[#000] shadow-[8px_8px_0px_#000] mb-4`}>
    <h3 className={`text-xl font-bold mb-4 flex items-center ${colorClass}`}>
      {icon}
      <span className="ml-2">{title}</span>
      {count > 0 && (
        <span className={`ml-2 ${colorClass} text-sm font-medium px-2.5 py-0.5 rounded-full border`}>
          {count}
        </span>
      )}
    </h3>
    {children}
  </div>
);

const Profile = () => {
  const { user, login } = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const loadInitialUserData = async () => {
    try {
      const res = await authService.getUserProfile();
      if (res.data.success) {
        login(res.data.user);
      }
    } catch (err) {
      console.error('Error fetching initial user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      setRefreshing(true);
      const res = await authService.getUserProfile();
      if (res.data.success) {
        login(res.data.user);
        enqueueSnackbar('Profile updated successfully', {
          variant: 'success',
        });
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      enqueueSnackbar('Failed to update profile', {
        variant: 'error',
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialUserData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleAuctionEnded = async (data) => {
      if (data.winner && data.winner === user?._id) {
        enqueueSnackbar('🏆 Congratulations! You won an auction!', {
          variant: 'success',
        });
      }
    };

    socket.on('auctionEnded', handleAuctionEnded);

    return () => {
      socket.off('auctionEnded', handleAuctionEnded);
    };
  }, [socket, user?._id, enqueueSnackbar]);

  if (loading) return <Loader message="Loading your profile..." />;

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-sm border-2 border-[#000] shadow-[8px_8px_0px_#000]">
        <h2 className="text-2xl font-bold text-center mb-6">Authentication Required</h2>
        <p className="text-gray-600 mb-8 text-center">You must be logged in to view your profile</p>
        <div className="flex justify-center gap-4">
          <Button to="/login" variant="primary" icon={<FaUser />}>Log In</Button>
          <Button to="/register" variant="secondary">Sign Up</Button>
        </div>
      </div>
    );
  }

  const totalSpent = user.wonAuctions
    ? user.wonAuctions.reduce((total, won) => total + won.amount, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fca311] to-transparent py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-white to-gray-100 rounded-sm border-2 border-[#000] shadow-[8px_8px_0px_#000] p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full">
              <div className="relative">
                <img
                  src={user.profilePicture || '/avatar.png'}
                  alt={user.username}
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#FCA311] shadow"
                />
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-extrabold text-[#14213D]">
                  {user.username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1 mb-4 md:mb-0">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Button
                onClick={refreshUserData}
                variant="secondary"
                disabled={refreshing}
                icon={<FaSync className={refreshing ? "animate-spin" : ""} />}
              >
                {refreshing ? "Updating..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-3 rounded-sm border-2 border-[#14213D]/20 shadow text-center">
              <FaTrophy className="text-2xl text-[#FCA311] mx-auto mb-1" />
              <div className="text-2xl font-bold text-[#14213D]">
                {user.wonAuctions ? user.wonAuctions.length : 0}
              </div>
              <div className="text-sm text-gray-600">Auctions Won</div>
            </div>

            <div className="bg-white p-3 rounded-sm border-2 border-[#14213D]/20 shadow text-center">
              <FaRupeeSign className="text-2xl text-[#FCA311] mx-auto mb-1" />
              <div className="text-2xl font-bold text-[#14213D]">
                {totalSpent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>

            <div className="bg-white p-3 rounded-sm border-2 border-[#14213D]/20 shadow text-center">
              <FaGavel className="text-2xl text-[#FCA311] mx-auto mb-1" />
              <div className="text-2xl font-bold text-[#14213D]">
                {user.createdAuctions ? user.createdAuctions.length : 0}
              </div>
              <div className="text-sm text-gray-600">Auctions Created</div>
            </div>

            <div className="bg-white p-3 rounded-sm border-2 border-[#14213D]/20 shadow text-center">
              <FaHistory className="text-2xl text-[#FCA311] mx-auto mb-1" />
              <div className="text-2xl font-bold text-[#14213D]">
                {user.participatedAuctions ? user.participatedAuctions.length : 0}
              </div>
              <div className="text-sm text-gray-600">Participated</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ProfileSection
              title="Auctions Won"
              icon={<FaTrophy className="text-yellow-500" />}
              count={user.wonAuctions?.length || 0}
              colorClass="text-yellow-600"
            >
              {user.wonAuctions && user.wonAuctions.length > 0 ? (
                <div className="space-y-2">
                  {user.wonAuctions.map((won, idx) => (
                    <CompactAuctionCard key={idx} auction={won.auction} wonAmount={won.amount} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FaTrophy />}
                  title="No Won Auctions Yet"
                  message="Start bidding on active auctions to win!"
                  action={
                    <Button to="/auctions" variant="primary" icon={<FaGavel />}>
                      Find Auctions
                    </Button>
                  }
                />
              )}
            </ProfileSection>

            {user.participatedAuctions && user.participatedAuctions.length > 0 && (
              <ProfileSection
                title="Recently Participated"
                icon={<FaStar className="text-blue-500" />}
                count={user.participatedAuctions.length}
                colorClass="text-blue-600"
              >
                <div className="space-y-2">
                  {user.participatedAuctions.slice(0, 5).map((auction, idx) => (
                    <CompactAuctionCard key={idx} auction={auction} />
                  ))}

                  {user.participatedAuctions.length > 5 && (
                    <div className="text-center mt-4">
                      <Button to="/auctions" variant="secondary" icon={<FaHistory />}>
                        View All {user.participatedAuctions.length} Participated Auctions
                      </Button>
                    </div>
                  )}
                </div>
              </ProfileSection>
            )}
          </div>

          <div>
            <ProfileSection
              title="Created Auctions"
              icon={<FaTag className="text-blue-800" />}
              count={user.createdAuctions?.length || 0}
              colorClass="text-blue-800"
            >
              {user.createdAuctions && user.createdAuctions.length > 0 ? (
                <div className="space-y-3">
                  {user.createdAuctions.map((auction, idx) => (
                    <CompactAuctionCard key={idx} auction={auction} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FaGavel />}
                  title="You Haven't Created Any Auctions"
                  message="Create your first auction and start selling!"
                  action={
                    <Button to="/auctions/new" variant="primary" icon={<FaGavel />}>
                      Create Auction
                    </Button>
                  }
                />
              )}
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;