import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-black shadow-lg border-b-2 border-gray-800 sticky top-0 z-50">
      <div className="mx-2 md:mx-4 px-2 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex justify-between items-center space-x-2" onClick={closeMenu}>
              <div>
                <img src='/auction.png' className="h-8 md:h-9 w-8 md:w-9 invert" alt="AuctionVerse" />
              </div>
              <span className="text-2xl font-bold text-[#e5e5e5]">AUCTION VERSE</span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <div className="ml-6 flex items-center space-x-5">
              <Link to="/">
                    <Button variant="nav" className="text-sm">
                      Home
                    </Button>
              </Link>
              <Link to="/auctions">
                    <Button variant="nav" className="text-sm">
                      Auctions
                    </Button>
              </Link>
              {isAuthenticated && user ? (
                <>
                 
                  <Link to="/auctions/new">
                    <Button variant="nav" className="text-sm">
                      Create Auction
                    </Button>
              </Link>
                  <Button
                    onClick={handleLogout}
                    variant="nav"
                    className="text-sm"
                  >
                    Logout
                  </Button>
                  <Link to="/profile" className="flex items-center space-x-2">
                    <img
                      src={user.profilePicture || '/avatar.png'}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="nav" className="text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="nav" className="text-sm">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#e5e5e5] hover:text-[#FCA311] focus:outline-none focus:text-[#FCA311] transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black border-t border-gray-200 shadow-lg">
              <Link
                to="/"
                className="block text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to="/auctions"
                className="block text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                onClick={closeMenu}
              >
                Auctions
              </Link>
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/auctions/new"
                    className="block text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    Create Auction
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    <img
                      src={user.profilePicture || '/avatar.png'}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover border-2 border-[#efefef]"
                    />
                    <span>{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-[#e5e5e5] hover:text-[#FCA311] hover:bg-gray-50 px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 