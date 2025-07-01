import { FaSpinner } from 'react-icons/fa';

const Loader = ({ 
  message = 'Loading..', 
  size = 'md', 
  variant = 'primary' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-[#FCA311]';
      case 'secondary': 
        return 'text-[#14213D]';
      case 'light':
        return 'text-[#e5e5e5]';
      default:
        return 'text-[#FCA311]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': 
        return 'text-2xl mb-2';
      case 'md':
        return 'text-4xl mb-4';
      case 'lg':
        return 'text-6xl mb-5';
      default:
        return 'text-4xl mb-4';
    }
  };
  
  const spinnerClasses = `animate-spin ${getSizeClasses()} ${getVariantClasses()}`;
  const textClasses = size === 'sm' ? 'text-base' : 'text-lg font-medium';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="relative">
        <FaSpinner className={spinnerClasses} />
      </div>
      <span className={`${textClasses} text-[#987200]`}>{message}</span>
    </div>
  );
};

export default Loader;