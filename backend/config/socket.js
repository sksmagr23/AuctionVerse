import { Server as SocketIOServer } from 'socket.io';

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
