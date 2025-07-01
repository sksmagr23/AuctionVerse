import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { FaHome, FaGavel, FaPlus, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';
import 'alertifyjs/build/css/themes/default.css';
import { useSnackbar } from 'notistack';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();


  const handleLogout = () => {
    alertify.confirm(
      'AuctionVerse - Confirm Logout', 
      'Are you sure you want to logout?',
      () => {
        logout();
        setIsMenuOpen(false);
        enqueueSnackbar('successfully logged out!', { 
          variant: 'success',
          preventDuplicate: true
        });
      },
      () => {
      }
    ).set('labels', {ok: 'Yes', cancel: 'No'});
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <header className={`bg-black shadow-lg border-b-2 border-gray-800 sticky top-0 z-50 transition-all duration-300 py-1.5`}>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <div className="relative">
                <img 
                  src='/auction.png' 
                  className="h-8 md:h-10 w-8 md:w-10 invert transition-transform duration-300 hover:scale-110" 
                  alt="AuctionVerse" 
                />
                <div className="absolute inset-0 bg-[#FCA311] rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#e5e5e5] tracking-wider">AUCTION<span className="text-[#FCA311]">VERSE</span></span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <div className="ml-6 flex items-center space-x-4">
              <Link to="/">
                <Button variant="nav" className="text-sm" icon={<FaHome />}>
                  Home
                </Button>
              </Link>
              <Link to="/auctions">
                <Button variant="nav" className="text-sm" icon={<FaGavel />}>
                  Auctions
                </Button>
              </Link>
              {isAuthenticated && user ? (
                <>
                  <Link to="/auctions/new">
                    <Button variant="nav" className="text-sm" icon={<FaPlus />}>
                      Host
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="nav"
                    className="text-sm"
                    icon={<FaSignOutAlt />}
                  >
                    Logout
                  </Button>
                  <Link to="/profile" className="flex items-center space-x-2 relative group">
                    <div className="relative overflow-hidden rounded-full border-2 border-[#e5e5e5] group-hover:border-[#FCA311] transition-colors duration-300">
                      <img
                        src={user.profilePicture || '/avatar.png'}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-[#FCA311] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="nav" className="text-sm" icon={<FaSignInAlt />}>
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="nav" className="text-sm" icon={<FaUserPlus />}>
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
              className="text-[#e5e5e5] hover:text-[#FCA311] focus:outline-none focus:text-[#FCA311] transition-colors duration-300"
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
          <div className="absolute left-0 right-0 top-full md:hidden bg-black border-t border-gray-700 shadow-lg z-50 transition-all duration-300 max-h-[80vh] overflow-y-auto">
            <div className="px-2 pt-2 pb-3 space-y-1 flex flex-col">
              <Link to="/" onClick={closeMenu}>
                <Button variant="nav" className="w-full justify-start" icon={<FaHome />}>
                  Home
                </Button>
              </Link>
              
              <Link to="/auctions" onClick={closeMenu}>
                <Button variant="nav" className="w-full justify-start" icon={<FaGavel />}>
                  Auctions
                </Button>
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <Link to="/auctions/new" onClick={closeMenu}>
                    <Button variant="nav" className="w-full justify-start" icon={<FaPlus />}>
                      Host Auction
                    </Button>
                  </Link>
                  
                  <Link to="/profile" onClick={closeMenu}>
                    <Button variant="nav" className="w-full justify-start">
                      <div className="flex items-center gap-2">
                        <img
                          src={user.profilePicture || '/avatar.png'}
                          alt="Profile"
                          className="h-7 w-7 rounded-full object-cover border border-[#e5e5e5]"
                        />
                        <span>{user.username}</span>
                      </div>
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={handleLogout}
                    variant="nav"
                    className="w-full justify-start"
                    icon={<FaSignOutAlt />}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="nav" className="w-full justify-start" icon={<FaSignInAlt />}>
                      Login
                    </Button>
                  </Link>
                  
                  <Link to="/register" onClick={closeMenu}>
                    <Button variant="nav" className="w-full justify-start" icon={<FaUserPlus />}>
                      Register
                    </Button>
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