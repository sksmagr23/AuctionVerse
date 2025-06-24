import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AuctionVerse. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 