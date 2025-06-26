import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-4 bg-[#E5E5E5]">
      <div className="flex flex-col items-center mb-2">
        <div className="bg-[#FCA311] rounded-full mb-2 shadow-lg">
          <img src='/auction.png' className="h-16 sm:h-24" />
        </div>
        <h1 className="text-5xl font-extrabold text-[#14213D] mb-2 drop-shadow-lg">Welcome to AuctionVerse!</h1>
        <p className="text-lg md:text-2xl text-[#14213D] max-w-2xl mb-8">
          AuctionVerse is your gateway to a world of exciting, real-time online auctions.<br />
          <span className="font-semibold text-[#FCA311]">Bid, win, and connect</span> with a vibrant community.<br />
          <span className="font-semibold">Features:</span>
          <ul className="list-disc list-inside text-left mx-auto mt-4 mb-4 max-w-xl text-base md:text-lg">
            <li>⚡ <span className="font-medium">Live, real-time bidding</span> with instant updates</li>
            <li>🔒 <span className="font-medium">Secure authentication</span> (Email & Google)</li>
            <li>🖼️ <span className="font-medium">Image uploads</span> for auction items</li>
            <li>🏆 <span className="font-medium">Profile dashboard</span> to track your wins and activity</li>
            <li>📱 <span className="font-medium">Modern, mobile-friendly UI</span> with smooth navigation</li>
          </ul>
          <span className="block mt-2">Ready to join the excitement? <span className="font-semibold text-[#FCA311]">Sign in, create an auction, or start bidding now!</span></span>
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
        {!isAuthenticated && (
          <Button as={Link} to="/login" variant="primary">Get Started</Button>
        )}
        <Button as={Link} to="/auctions" variant="secondary">Browse Auctions</Button>
      </div>
    </div>
  );
};

export default Home; 