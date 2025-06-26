import { Server as SocketIOServer } from 'socket.io';
import User from '../models/User.js';

let io = null;

export const initSocket = (server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
      socket.to(auctionId).emit('userJoined', { socketId: socket.id });
    });

    socket.on('joinLobby', async ({ auctionId, userId }) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          socket.join(auctionId);
          io.to(auctionId).emit('userJoinedLobby', {
            userId,
            username: user.username,
          });
        }
      } catch (err) {
        console.log('Error joining lobby:', err);
      }
    });

    socket.on('leaveLobby', async ({ auctionId, userId }) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          io.to(auctionId).emit('userLeftLobby', {
            userId,
            username: user.username,
          });
          socket.leave(auctionId);
        }
      } catch (err) {
        console.log('Error leaving lobby:', err);
      }
    });

    socket.on('newBid', ({ auctionId, bid }) => {
      socket.to(auctionId).emit('bidPlaced', bid);
    });

    socket.on('auctionEnded', (auctionId) => {
      io.to(auctionId).emit('auctionEnded');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
