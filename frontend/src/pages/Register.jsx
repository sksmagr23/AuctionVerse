import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGoogle } from 'react-icons/fa';
import { useSnackbar } from 'notistack';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  useEffect(() => {
    document.querySelectorAll('.animate-on-load').forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('opacity-0');
        el.classList.remove('translate-2-4');
      }, 100 * i);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.register(username, email, password);
      if (response.data.success) {
        enqueueSnackbar('AuctionVerse Account created successfully!', {
          variant: 'success',
          preventDuplicate: true
        });
        const loginResponse = await authService.login(email, password);
        if (loginResponse.data.success) {
          login(loginResponse.data.data);
          navigate('/');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        preventDuplicate: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.googleLogin();
    } catch {
      enqueueSnackbar('Google sign up failed. Please try again.', {
        variant: 'error',
        preventDuplicate: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-auto flex items-start justify-center bg-[#fca311] px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6 animate-on-load opacity-0 translate-y-2 transition-all duration-500">
          <h1 className="text-4xl font-bold text-[#14213D] mb-3">Create Account</h1>
          <p className="text-gray-900 text-lg">Join the AuctionVerse platform today</p>
        </div>

        <div className="bg-gradient-to-b to-[#f7f3eb] from-white rounded-sm border-2 border-[#000] shadow-[10px_10px_0px_#000] p-6 transition-all duration-200 animate-on-load opacity-0 mb-4 translate-y-2" style={{ transitionDelay: '100ms' }}>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="username"
              type="text"
              label="Username"
              icon={<FaUser />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username :)"
              required
              disabled={isLoading}
              autoComplete="username"
              style={{ transitionDelay: '100ms' }}
            />
          
            <FormInput
              id="email"
              type="email"
              label="Email Address"
              icon={<FaEnvelope />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your valid email"
              required
              disabled={isLoading}
              autoComplete="email"
              style={{ transitionDelay: '100ms' }}
            />

            <FormInput
              id="password"
              type="password"
              label="Password"
              icon={<FaLock />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              disabled={isLoading}
              autoComplete="new-password"
              style={{ transitionDelay: '100ms' }}
            />

            <div className="animate-on-load opacity-0 translate-y-4 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={isLoading}
                icon={<FaUserPlus />}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            <div className="text-center animate-on-load opacity-0 translate-y-4 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
              <Link
                className="text-[#FCA311] hover:text-[#000000] font-medium text-md transition-colors duration-200"
                to="/login"
              >
                Already have an account? <span className="font-bold">Sign in</span>
              </Link>
            </div>
          </form>
          
          <div className="relative my-6 animate-on-load opacity-0 translate-y-4 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-500"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-800 font-medium">OR</span>
            </div>
          </div>

          <div className="animate-on-load opacity-0 translate-y-4 mb-4 transition-all duration-300" style={{ transitionDelay: '100ms' }}>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className="flex justify-center items-center">
                <FaGoogle className='w-5 font-bold mr-1'/>
                Continue with Google
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;