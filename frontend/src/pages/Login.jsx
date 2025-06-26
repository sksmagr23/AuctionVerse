import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.data.success) {
        login(response.data.data);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.googleLogin();
    } catch {
      setError('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-[100vh] flex items-center-safe justify-center bg-[#E5E5E5] px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[#14213D] mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your auction journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <Link
                className="text-[#FCA311] hover:text-[#eaa111] font-medium text-sm transition-colors duration-200"
                to="/register"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <span className='flex justify-center items-center'>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login; 