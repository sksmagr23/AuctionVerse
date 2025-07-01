import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import auctionService from "../services/auction.service";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { formatToIST } from "../utils/formatDate";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { useSnackbar } from "notistack";
import {
  FaBolt,
  FaClock,
  FaFlagCheckered,
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaRupeeSign,
  FaCalendarAlt,
  FaUserCheck,
  FaTrophy,
  FaBan,
  FaHourglassHalf,
} from "react-icons/fa";
import { GoCheckCircleFill } from "react-icons/go";

const statusMap = {
  upcoming: {
    color: "bg-gradient-to-r from-[#fca311] to-[#fac311]",
    textColor: "text-[#14213D]",
    icon: <FaClock className="mr-1.5" />,
    label: "Upcoming",
  },
  active: {
    color: "bg-gradient-to-r from-green-600 to-emerald-400",
    textColor: "text-white",
    icon: <FaFlagCheckered className="mr-1.5 animate-pulse" />,
    label: "Live",
  },
  ended: {
    color: "bg-gradient-to-r from-red-600 to-orange-500",
    textColor: "text-white",
    icon: <GoCheckCircleFill className="mr-1.5" />,
    label: "Ended",
  },
};

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredParticipants, setRegisteredParticipants] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
   const [timeRemaining, setTimeRemaining] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();
  const { enqueueSnackbar } = useSnackbar();

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionService.getAuction(id);
      if (response.data.success) {
        setAuction(response.data.auction);
      }
    } catch {
      showNotification("Failed to load auction details", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredParticipants = async () => {
    try {
      const res = await auctionService.getRegisteredParticipants(id);
      if (res.data.success) {
        setRegisteredParticipants(res.data.participants);
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showNotification(
        "Please sign in to register for this auction",
        "warning"
      );
      return;
    }

    setIsRegistering(true);
    try {
      await auctionService.registerForAuction(id);
      await fetchRegisteredParticipants();
      showNotification("Successfully registered for auction!", "success");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const showNotification = (message, variant, icon) => {
    enqueueSnackbar(
      <div className="flex items-center">
        {icon}
        <span className="ml-2">{message}</span>
      </div>,
      {
        variant,
        preventDuplicate: true,
        autoHideDuration: 3000,
      }
    );
  };

  const isOwner =
    user && auction?.createdBy && user._id === auction.createdBy._id;
  const isRegistered =
    user && registeredParticipants.some((p) => p._id === user._id);
  const canRegister =
    isAuthenticated &&
    auction &&
    !isOwner &&
    !isRegistered &&
    auction.status === "upcoming";

  const canOwnerJoinLobby = isOwner && auction && auction.status === "active";
  const canRegisteredJoinLobby =
    isRegistered && !isOwner && auction && auction.status === "active";
  const cannotRegisterActiveAuction = 
    isAuthenticated && 
    auction && 
    auction.status === "active" && 
    !isOwner && 
    !isRegistered;

  useEffect(() => {
    fetchAuction();
    fetchRegisteredParticipants();
  }, [id]);

  useEffect(() => {
    if (!auction || auction.status !== 'upcoming') {
      return;
    }
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const startTime = new Date(auction.startTime);
      const diff = startTime - now;
      
      if (diff <= 0) {
        setTimeRemaining('Starting...');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const formattedTime = [];
      if (days > 0) formattedTime.push(`${days}d`);
      if (days > 0 || hours > 0) formattedTime.push(`${hours}h`);
      if (days > 0 || hours > 0 || minutes > 0) formattedTime.push(`${minutes}m`);
      formattedTime.push(`${seconds}s`);
      
      setTimeRemaining(formattedTime.join(' : '));
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [auction]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinAuction", id);

    socket.on("bidPlaced", (data) => {
      if (data.bid.auction === id) {
        showNotification(
          `New bid: ₹${data.currentPrice.toLocaleString()}`,
          "info",
          <FaRupeeSign className="text-blue-500" />
        );
        setAuction((prev) => ({
          ...prev,
          currentPrice: data.currentPrice,
        }));
      }
    });

    socket.on("auctionEnded", (data) => {
      if (data.auctionId === id) {
        showNotification(
          "Auction has ended!",
          "warning",
          <FaFlagCheckered className="text-red-500" />
        );
        fetchAuction();
      }
    });

    socket.on("auctionStarted", (data) => {
      if (data.auctionId === id) {
        showNotification(
          "Auction has started!",
          "success",
          <FaBolt className="text-green-500" />
        );
        setAuction((prev) => ({
          ...prev,
          status: "active",
        }));
      }
    });

    socket.on("userJoined", (data) => {
      if (data.auctionId === id) {
        showNotification(
          `${data.username} joined the auction`,
          "info",
          <FaUser className="text-blue-500" />
        );
        setAuction((prev) => ({
          ...prev,
          participants: [
            ...(prev.participants || []),
            { _id: data.userId, username: data.username },
          ],
        }));
      }
    });

    socket.on("participantRegistered", (data) => {
      if (data.auctionId === id) {
        fetchRegisteredParticipants();
        showNotification(
          `${data.username} registered for the auction`,
          "info",
          <FaUserCheck className="text-blue-500" />
        );
      }
    });

    return () => {
      socket.off("bidPlaced");
      socket.off("auctionEnded");
      socket.off("auctionStarted");
      socket.off("userJoined");
      socket.off("participantRegistered");
    };
  }, [id, socket, enqueueSnackbar]);

  if (loading) return <Loader message="Loading auction details..." />;
  if (!auction)
    return (
      <div className="max-w-4xl mx-auto my-8 px-4 text-center">
        Auction not found
      </div>
    );

  const status = statusMap[auction.status] || {
    color: "bg-gray-500",
    textColor: "text-white",
    icon: null,
    label: auction.status,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111]/30 to-[#111]/60 py-6 px-4">
      <div className="max-w-6xl mx-auto mb-6">
        <span className="flex justify-between">
          <Button
            to="/auctions"
            variant="secondary"
            icon={<FaArrowLeft />}
            className="mb-6"
          >
            Back
          </Button>
          {auction.status === "active" &&
            (canOwnerJoinLobby || canRegisteredJoinLobby ? (
              <Link to={`/lobby/${auction._id}`} className="">
                <Button
                  variant="success"
                  className=" mb-6"
                  icon={<FaFlagCheckered />}
                >
                  Join Lobby
                </Button>
              </Link>
            ) : (
              <Button
                variant="success"
                className="mb-6"
                disabled
                title="Registration required to join"
                icon={<FaBolt />}
              >
                Auction in progress
              </Button>
            ))}
        </span>
        <div className="bg-[#ffca74]/70 drop-shadow-xl drop-shadow-[#ff9d00] border-2 border-[#000] shadow-[10px_10px_0px_#000] overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#f7f3eb] to-white p-4 md:p-6 border-b-2 border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl md:text-4xl font-extrabold text-[#14213D]">
                {auction.title}
              </h1>
              <div
                className={`px-4 py-2 rounded-md flex items-center font-bold ${status.color} ${status.textColor}`}
              >
                {status.icon}
                {status.label}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <FaUser className="text-[#FCA311]" />
              <span>
                Hosted by{" "}
                <span className="font-semibold text-[#af6c00]">
                  {auction.createdBy?.username || "Unknown"}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="overflow-hidden shadow-md">
                <img
                  className="w-full object-contain"
                  src={auction.itemImage || "/auction.png"}
                  alt={auction.title}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="bg-[#ffffff] rounded-sm border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9] p-4">
                  <h3 className="text-lg font-bold text-[#14213D] mb-2">
                    Base Price
                  </h3>
                  <div className="text-2xl font-bold text-[#FCA311] flex items-center">
                    <FaRupeeSign className="text-lg mr-1" />
                    {auction.basePrice.toLocaleString()}
                  </div>
                </div>

                {auction.status === "active" && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-sm border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9] p-4">
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      Current Bid
                    </h3>
                    <div className="text-2xl font-bold text-green-600 flex items-center">
                      <FaRupeeSign className="text-lg mr-1" />
                      {auction.currentPrice.toLocaleString()}
                    </div>
                  </div>
                )}

                {auction.status === "ended" && auction.winner && (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-100 rounded-sm border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9] p-4">
                    <h3 className="text-lg font-bold text-amber-800 flex items-center mb-2">
                      <FaTrophy className="mr-2 text-[#FCA311]" /> Winning Bid
                    </h3>
                    <div className="text-2xl font-bold text-green-700 flex items-center">
                      <FaRupeeSign className="text-lg mr-1" />
                      {auction.winningBid?.toLocaleString() ||
                        auction.currentPrice?.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {auction.status === "upcoming" ? (
                <div className="bg-gray-50 self-center py-2 text-center border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9]">
                  <div className="flex items-center justify-center text-gray-600 mb-1">
                    <FaHourglassHalf className="mr-1.5 text-[#FCA311]" />
                    <div className="text-xs">Time Left</div>
                  </div>
                    <div className="text-md font-semibold">
                      {timeRemaining || "Calculating..."}
                    </div>
                </div>
                
              ) : (
                <div className="bg-gray-50 self-center py-3 text-center border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9]">
                  <div className="flex items-center justify-center text-gray-500 mb-1">
                    <FaCalendarAlt className="mr-1.5 text-[#FCA311]" />
                    <div className="text-xs">Start Time</div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatToIST(auction.startTime)}
                  </div>
                </div>
              )}
                <div className="bg-gray-50 self-center py-2 text-center border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9]">
                  <div className="flex items-center justify-center text-gray-500 mb-1">
                    <FaUsers className="mr-1.5 text-[#FCA311]" />
                    <div className="text-xs">Participants</div>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {registeredParticipants.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 lg:col-span-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold underline text-[#14213D] mb-2">
                  Description
                </h2>
                <div className="bg-[#fac311] rounded-sm p-3">
                  <p className="text-gray-700 whitespace-pre-line">
                    {auction.description}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#f7f3eb] to-white rounded-sm border-2 border-gray-200 p-3 mb-4">
                <h2 className="text-xl font-bold text-[#14213D] mb-4">
                  Actions
                </h2>

                {canRegister && (
                  <Button
                    variant="primary"
                    className="w-full mb-4"
                    onClick={handleRegister}
                    disabled={isRegistering}
                    icon={<FaUserCheck />}
                  >
                    {isRegistering ? "Registering..." : "Register for Auction"}
                  </Button>
                )}

                {isRegistered && auction.status === "upcoming" && (
                  <Button
                    variant="success"
                    className="w-full mb-4"
                    disabled
                    icon={<FaUserCheck />}
                  >
                    Registered Successfully
                  </Button>
                )}
                
                {cannotRegisterActiveAuction && (
                  <div className="bg-red-50 border-l-4 border-orange-400 p-4 text-orange-700 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <FaBan className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-600">
                          Registration Closed
                        </h3>
                        <div className="mt-2 text-sm text-orange-500">
                          <p>
                            You can't register for this auction as it has already started.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {auction.status === "ended" && (
                  <div className="bg-gradient-to-r from-gray-50 to-white p-2 md:p-3 rounded-sm text-center border-2 border-gray-300">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-4">
                      <FaFlagCheckered className="text-red-500" /> Auction Ended
                    </h3>

                    {auction.winner ? (
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-3 rounded-sm border border-yellow-200">
                        <div className="flex items-center justify-center mb-2">
                          <FaTrophy className="text-[#FCA311] text-2xl mr-2" />
                          <span className="text-lg font-bold text-[#14213D]">
                            Winner
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-green-600 mb-2">
                          {auction.winner.username}
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg text-gray-600 bg-gray-50 p-4 rounded-sm border border-gray-200">
                        No bids were placed in this auction.
                      </p>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-800 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FaUser className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          <Link to="/login" className="font-medium underline">
                            Login
                          </Link>{" "}
                          /{" "}
                          <Link
                            to="/register"
                            className="font-medium underline"
                          >
                            Register
                          </Link>{" "}
                          with AuctionVerse to participate in this auction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {auction.status === "upcoming" &&
                  !isRegistered &&
                  !isOwner &&
                  isAuthenticated && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 text-yellow-900 mt-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <FaClock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm">
                            You must register before the auction starts to
                            participate in bidding.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {registeredParticipants.length > 0 && (
                <div className="bg-[#222] border border-[#2e2e2ee9] shadow-[5px_0px_5px_#2e2e2ee9] p-3 hidden md:block">
                  <h2 className="text-xl font-bold text-[#eaf1ff] mb-4 flex items-center">
                    <FaUsers className="mr-2 text-[#FCA311]" />
                    Registered Participants
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {registeredParticipants.map((participant) => (
                      <div
                        key={participant._id}
                        className="bg-[#ffd752] p-2 rounded flex items-center gap-2 border border-gray-200"
                      >
                        <img
                          src={participant.profilePicture || "/avatar.png"}
                          className="h-8 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        <span className="text-sm font-medium truncate">
                          {participant.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
