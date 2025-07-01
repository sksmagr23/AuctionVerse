import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import { 
  FaGavel, 
  FaLock, 
  FaImage, 
  FaUser, 
  FaArrowRight,
  FaUsers,
  FaBell,
  FaCalendarCheck,
} from 'react-icons/fa';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div>
      <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-[#fca311] to-transparent relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center mb-12 animate-on-scroll opacity-0 transform translate-y-4 hidden md:block">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-[#14213D]">AUCTION</span>
            <span className="text-black ml-2">VERSE</span>
          </h1>
          <div className="h-1 w-48 bg-gradient-to-r from-[#14213D] via-[#ff8800] to-[#14213D] mx-auto mt-3"></div>
        </div>
      
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center justify-center mx-auto">
            <div className="order-2 md:order-1 animate-on-scroll opacity-0 transform translate-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-[#14213D] leading-tight mb-4">
                Your Premier Platform for <span className="text-[#754800]">Real-Time Auctions</span>
              </h2>
              <p className="text-md md:text-lg text-gray-900 mb-8">
                Step into AuctionVerse — where buyers meet sellers in real-time battles for the best deals. Bid smart, win big, all in a secure and dynamic marketplace.
              </p>
              <div className="flex justify-start gap-3 md:gap-4">
                <Button 
                  to="/auctions" 
                  variant="primary" 
                  icon={<FaArrowRight />} 
                  iconPosition="right"
                >
                  Browse Auctions
                </Button>
                
                {isAuthenticated ? (
                  <Button 
                    to="/auctions/new" 
                    variant="secondary" 
                    icon={<FaGavel />}
                  >
                    Host Auction
                  </Button>
                ) : (
                  <Button 
                    to="/register" 
                    variant="secondary" 
                    icon={<FaUser />}
                  >
                    Join Now
                  </Button>
                )}
              </div>
            </div>
            
            <div className="order-1 md:order-2 flex justify-center md:justify-end animate-on-scroll opacity-0 transform translate-y-4">
              <div className="relative">
                
                <div className="rounded-full relative shadow-3xl">
                  <img 
                    src="/auction.png" 
                    alt="AuctionVerse" 
                    className="w-48 h-48 md:w-72 md:h-72 relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12 px-4 md:py-20 bg-gradient-to-b from-transparent via-[#dfdede] to-transparent relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 animate-on-scroll opacity-0 transform translate-y-4">
            <h2 className="text-2xl md:text-4xl font-bold text-[#14213D] mb-4">
              Premier Auction Experience
            </h2>
            <div className="h-1 w-40 bg-[#FCA311] mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-md md:text-lg">
              AuctionVerse provides a complete platform with everything you need to participate in 
              online auctions, whether you're buying or selling.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaGavel className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Live Bidding</h3>
              <p className="text-gray-600">
                Experience the excitement of real-time auctions with instant updates and competitive bidding.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaLock className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Trade with confidence on our secure platform with buyer and seller protection.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaCalendarCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Timely Registration</h3>
              <p className="text-gray-600">
                Registration for auctions closes when the event begins. Register early to ensure you don't miss out on bidding opportunities.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaUser className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Personal Dashboard</h3>
              <p className="text-gray-600">
                Easily track your won auctions, monitor your created listings, and manage your profile.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaBell className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Instant Alerts</h3>
              <p className="text-gray-600">
                Receive timely notifications about auction status, outbids, and final results.
              </p>
            </div>

            <div className="bg-gradient-to-r from-white to-transparent p-6 rounded-sm border-2 border-[#fca311] shadow-[8px_8px_0px_#fca311] transition-all duration-300 transform animate-on-scroll opacity-0 translate-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="bg-gradient-to-r from-[#FCA311] to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md">
                <FaUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[#14213D] mb-3">Live Auction Chat</h3>
              <p className="text-gray-600">
                Engage in real-time discussions during auctions, ask questions about items, and communicate directly with sellers and other bidders.
              </p>
            </div>

          </div>
        </div>
      </section>

      <section className="py-8 md:py-16 bg-gradient-to-b to-[#fca311] from-transparent text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 animate-on-scroll opacity-0 transform translate-y-4">
          <h2 className="text-2xl md:text-4xl text-blue-900 font-bold mb-6">
            Ready to Join <span className="text-[#000]">AuctionVerse</span>?
          </h2>
          <p className="text-lg text-gray-800 mb-10 max-w-2xl mx-auto">
            Start bidding on unique items or host your own auctions today!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {!isAuthenticated ? (
              <>
                <Button 
                  to="/register" 
                  variant="secondary" 
                  icon={<FaUser />}
                  className="transform transition-transform hover:scale-105"
                >
                  Sign Up Now
                </Button>
                <Button 
                  to="/login" 
                  variant="secondary"
                  className="transform transition-transform hover:scale-105"
                >
                  Log In
                </Button>
              </>
            ) : (
              <>
                <Button 
                  to="/auctions/new" 
                  variant="secondary" 
                  icon={<FaGavel />}
                  className="transform transition-transform hover:scale-105"
                >
                  Host Auction
                </Button>
                <Button 
                  to="/auctions" 
                  variant="secondary" 
                  icon={<FaArrowRight />} 
                  iconPosition="right"
                  className="transform transition-transform hover:scale-105"
                >
                  Browse Auctions
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;