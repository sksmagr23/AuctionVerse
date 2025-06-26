import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-black mt-auto">
      <div className="mx-2  px-2 py-3.5">
        <div className="flex flex-col sm:flex-row justify-center gap-2 items-center">
          <div className="flex items-center space-x-1.5">
            <div>
              <img src='/auction.png' className="h-7 w-7" />
            </div>
            <span className="text-md md:text-lg font-semibold">AUCTION VERSE</span>
          </div>
          <p className="text-gray-800 text-sm">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer; 