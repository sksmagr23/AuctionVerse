
const Footer = () => {
  return (
    <footer className="bg-black text-[#e5e5e5] mt-auto">
      <div className="mx-2  px-2 py-3.5">
        <div className="flex flex-col sm:flex-row justify-center gap-2 items-center">
          <div className="flex items-center space-x-1.5">
            <div>
              <img src='/auction.png' className="h-7 w-7 invert" />
            </div>
            <span className="text-md md:text-lg font-semibold">AUCTION VERSE</span>
          </div>
          <p className="text-gray-300 text-sm space-x-1">
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
            <span>Made by <a href="https://github.com/sksmagr23" className='italic'>sksmagr23</a></span>
          </p>
          
        </div>
      </div>
    </footer>
  );
};
export default Footer; 