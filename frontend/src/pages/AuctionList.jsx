import { useState, useEffect } from 'react';
import auctionService from '../services/auction.service';
import AuctionCard from '../components/AuctionCard';
import { useSocket } from '../contexts/SocketContext';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { useSnackbar } from 'notistack';
import {
  FaClock,
  FaHistory,
  FaGavel,
  FaPlus,
  FaSync,
  FaFlagCheckered,
  FaExclamation
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useAuth();

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

  const fetchAuctions = async () => {
    try {
      setRefreshing(true);
      const response = await auctionService.getAllAuctions();
      if (response.data.success) {
        setAuctions(response.data.auctions);
      }
    } catch {
      showNotification(
        'Failed to load auctions',
        'error',
        <FaExclamation className="text-white" />
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuctions()
  }, [])

  const handleRefresh = () => {
    fetchAuctions();
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('auctionsUpdated', () => {
      showNotification(
        'Auctions updated with latest data',
        'info',
        <FaSync className="text-blue-100" />
      );
      fetchAuctions();
    });

    socket.on('auctionCreated', (newAuction) => {
      showNotification(
        'New auction has been created',
        'success',
        <FaPlus className="text-orange-100" />
      );
      setAuctions(prev => [newAuction, ...prev]);
    });

    socket.on('auctionStarted', (data) => {
      showNotification(
        'An auction has just gone live!',
        'success',
        <FaFlagCheckered className="text-yellow-100" />
      );
      setAuctions(prev =>
        prev.map(auction =>
          auction._id === data.auctionId
            ? { ...auction, status: 'active' }
            : auction
        )
      );
    });

    socket.on('auctionEnded', (data) => {
      showNotification(
        'An auction has ended',
        'info',
        <FaHistory className="text-blue-100" />
      );
      setAuctions(prev =>
        prev.map(auction =>
          auction._id === data.auctionId
            ? { ...auction, status: 'ended', winner: data.winner, winningBid: data.winningBid }
            : auction
        )
      );
    });

    return () => {
      socket.off('auctionsUpdated');
      socket.off('auctionCreated');
      socket.off('auctionStarted');
      socket.off('auctionEnded');
    };
  }, [socket, enqueueSnackbar]);

  if (loading) return <Loader message="Loading available auctions..." />;

  const liveAuctions = auctions.filter(a => a.status === 'active');
  const upcomingAuctions = auctions.filter(a => a.status === 'upcoming');
  const pastAuctions = auctions.filter(a => a.status === 'ended');

  const EmptyState = ({ message, icon, color }) => (
    <div className="bg-white rounded-sm border-2 border-gray-200 p-6 text-center flex flex-col items-center justify-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );

  const SectionHeader = ({ icon, title, color }) => (
    <div className="flex items-center mb-6 border-b-2 border-[#eaa911] pb-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${color}`}>
        {icon}
      </div>
      <h2 className={`text-2xl font-bold text-gray-800`}>
        {title}
      </h2>
    </div>
  );

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-b to-white from-transparent">
      <div className="bg-[#FCA311] py-4 mb-6 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#14213D] flex items-center">
                <FaGavel className="mr-3 text-2xl md:text-3xl" />
                Auctions Marketplace
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <Button
                  to="/auctions/new"
                  variant="secondary"
                  icon={<FaPlus />}
                >
                  Host Auction
                </Button>
              )}

              <Button
                onClick={handleRefresh}
                variant="primary"
                disabled={refreshing}
                icon={<FaSync className={refreshing ? "animate-spin" : ""} />}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <section className="mb-12">
          <SectionHeader
            icon={<FaFlagCheckered className="text-white text-lg" />}
            title="Live Auctions"
            color="bg-green-500 text-green-500"
            count={liveAuctions.length}
          />

          {liveAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.map((auction) => (
                <div key={auction._id} className="transform transition-all duration-300 hover:-translate-y-1">
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="No live auctions at the moment. Register for an upcoming auction"
              icon={<FaFlagCheckered className="text-white text-xl" />}
              color="bg-green-500"
            />
          )}
        </section>

        <section className="mb-12">
          <SectionHeader
            icon={<FaClock className="text-white text-lg" />}
            title="Upcoming Auctions"
            color="bg-[#FCA311] text-[#FCA311]"
            count={upcomingAuctions.length}
          />

          {upcomingAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAuctions.map((auction) => (
                <div key={auction._id} className="transform transition-all duration-300 hover:-translate-y-1">
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="No upcoming auctions scheduled yet. Why not host one yourself?"
              icon={<FaClock className="text-white text-xl" />}
              color="bg-[#FCA311]"
            />
          )}
        </section>

        <section className="mb-12">
          <SectionHeader
            icon={<FaHistory className="text-white text-lg" />}
            title="Past Auctions"
            color="bg-gray-500 text-gray-500"
            count={pastAuctions.length}
          />

          {pastAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastAuctions.map((auction) => (
                <div key={auction._id} className="transform transition-all duration-300 hover:-translate-y-1">
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="No past auctions found."
              icon={<FaHistory className="text-white text-xl" />}
              color="bg-gray-500"
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default AuctionList;