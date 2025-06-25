import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-6 drop-shadow-lg">Welcome to AuctionVerse!</h1>
      <p className="text-lg md:text-2xl text-gray-700 max-w-2xl mb-8">
        AuctionVerse is your gateway to a world of exciting, real-time online auctions. <br />
        <span className="font-semibold text-blue-600">Bid, win, and connect</span> with a vibrant community. <br />
        <span className="font-semibold">Features:</span>
        <ul className="list-disc list-inside text-left mx-auto mt-4 mb-4 max-w-xl text-base md:text-lg">
          <li>⚡ <span className="font-medium">Live, real-time bidding</span> with instant updates</li>
          <li>🔒 <span className="font-medium">Secure authentication</span> (Email & Google)</li>
          <li>🖼️ <span className="font-medium">Image uploads</span> for auction items</li>
          <li>🏆 <span className="font-medium">Profile dashboard</span> to track your wins and activity</li>
          <li>📱 <span className="font-medium">Modern, mobile-friendly UI</span> with smooth navigation</li>
        </ul>
        <span className="block mt-2">Ready to join the excitement? <span className="font-semibold text-green-600">Sign in, create an auction, or start bidding now!</span></span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {!isAuthenticated && (
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transition">Get Started</Link>
        )}
        <Link to="/auctions" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transition">Browse Auctions</Link>
      </div>
    </div>
  );
};

export default Home; 