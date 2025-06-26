import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import auctionService from "../services/auction.service";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { formatToIST } from "../utils/formatDate";
import Button from "../components/Button";
import {
  FaBolt,
  FaClock,
  FaFlagCheckered,
  FaUser,
  FaUsers,
} from "react-icons/fa";

const statusMap = {
  upcoming: {
    color: "bg-yellow-500 text-white",
    icon: <FaClock className="inline-block mr-1 text-yellow-100" />,
    label: "Upcoming",
  },
  active: {
    color: "bg-green-500 text-white",
    icon: <FaBolt className="inline-block mr-1 text-green-100 animate-pulse" />,
    label: "Live",
  },
  ended: {
    color: "bg-red-500 text-white",
    icon: <FaFlagCheckered className="inline-block mr-1 text-red-100" />,
    label: "Ended",
  },
};

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateNotification, setUpdateNotification] = useState("");
  const [registeredParticipants, setRegisteredParticipants] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionService.getAuction(id);
      if (response.data.success) {
        setAuction(response.data.auction);
      }
    } catch (err) {
      setError(err);
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
    } catch {
      // no need
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await auctionService.registerForAuction(id);
      await fetchRegisteredParticipants();
      showUpdateNotification("✅ Registered for auction!");
    } catch (err) {
      setError(err.response?.data?.message || "Could not register.");
    } finally {
      setIsRegistering(false);
    }
  };

  const showUpdateNotification = (message) => {
    setUpdateNotification(message);
    setTimeout(() => setUpdateNotification(""), 3000);
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

  useEffect(() => {
    fetchAuction();
    fetchRegisteredParticipants();
    if (socket) {
      socket.emit("joinAuction", id);
      socket.on("bidPlaced", (data) => {
        if (data.bid.auction === id) {
          showUpdateNotification("💰 New bid placed!");
          setAuction((prev) => ({
            ...prev,
            currentPrice: data.currentPrice,
          }));
        }
      });
      socket.on("auctionEnded", (data) => {
        if (data.auctionId === id) {
          showUpdateNotification("🏁 Auction ended!");
          fetchAuction();
        }
      });
      socket.on("auctionStarted", (data) => {
        if (data.auctionId === id) {
          showUpdateNotification("🚀 Auction started!");
          setAuction((prev) => ({
            ...prev,
            status: "active",
          }));
        }
      });
      socket.on("userJoined", (data) => {
        if (data.auctionId === id) {
          showUpdateNotification(`👤 ${data.username} joined the auction`);
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
          showUpdateNotification(
            `👤 ${data.username} registered for the auction`
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
    }
  }, [id, socket]);

  if (loading)
    return <div className="text-center mt-8">Loading auction details...</div>;
  if (error && !auction)
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!auction) return <p className="text-center mt-8">Auction not found.</p>;

  const status = statusMap[auction.status] || {
    color: "bg-gray-500",
    icon: null,
    label: auction.status,
  };

  return (
    <div className="container mx-auto p-2">
      <div className="bg-white shadow-2xl rounded-2xl border-2 border-[#FCA311] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-6 flex flex-col gap-4 justify-center items-center bg-gradient-to-br from-[#fffbe6] to-[#f3f4f6]">
            <img
              className="w-full max-w-xs object-cover rounded-xl border-2 border-[#FCA311] shadow"
              src={auction.itemImage || "/auction.png"}
              alt={auction.title}
            />
            <div className="flex gap-2 mt-2">
              <span
                className={`px-3 py-1 text-sm font-bold flex items-center rounded-full shadow ${status.color}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#14213D] mb-1">
                {auction.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaUser className="text-[#FCA311]" />
                <span>
                  Hosted by{" "}
                  <span className="font-semibold text-[#FCA311]">
                    {auction.createdBy.username}
                  </span>
                </span>
              </div>
              <p className="text-gray-700 mb-4 text-lg">
                {auction.description}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Auction starts on</div>
                  <div className="text-lg font-semibold">
                    {formatToIST(auction.startTime)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <FaUsers className="inline-block mr-1" />
                    Participants
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {registeredParticipants.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              {updateNotification && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 animate-pulse">
                  {updateNotification}
                </div>
              )}
              {canRegister && (
                <Button
                  variant="primary"
                  className="w-full mb-4"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registering..." : "Register for Auction"}
                </Button>
              )}
              {isRegistered && auction.status === "upcoming" && (
                <Button variant="secondary" className="w-full mb-4" disabled>
                  Registered
                </Button>
              )}
              {auction.status === "active" &&
                (canOwnerJoinLobby || canRegisteredJoinLobby ? (
                  <Link to={`/lobby/${auction._id}`}>
                    <Button variant="success" className="w-full mb-4">
                      Join Lobby
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="success"
                    className="w-full mb-4"
                    disabled
                    title="Register to join the lobby"
                  >
                    Join Lobby
                  </Button>
                ))}
              {auction.status === "ended" ? (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg text-center border-2 border-red-200">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <FaFlagCheckered className="text-red-500" /> Auction Ended
                  </h3>
                  {auction.winner ? (
                    <>
                      <p className="mt-2 text-lg">
                        Winner:{" "}
                        <span className="font-semibold text-green-600">
                          {auction.winner.username}
                        </span>
                      </p>
                      <p className="mt-1 text-lg">
                        Winning Bid:{" "}
                        <span className="font-semibold text-green-600">
                          ${auction.winningBid.toLocaleString()}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-lg text-gray-600">
                      No bids were placed.
                    </p>
                  )}
                </div>
              ) : null}
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-[#FCA311]/20 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">
                    Current Price:
                  </span>
                  <span className="text-4xl font-bold text-green-600">
                    ${auction.currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
