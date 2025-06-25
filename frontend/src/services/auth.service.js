import axios from 'axios';

axios.defaults.withCredentials = true;

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const register = (username, email, password) => {
  return axios.post(`${BACKEND_URL}/api/auth/register`, { username, email, password });
};

const login = (email, password) => {
  return axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
};

const logout = () => {
  return axios.post(`${BACKEND_URL}/api/auth/logout`);
};

const getUser = () => {
  return axios.get(`${BACKEND_URL}/api/auth/user`);
};

const getUserProfile = () => {
  return axios.get(`${BACKEND_URL}/api/auth/profile`);
};

const googleLogin = () => {
  window.location.href = `${BACKEND_URL}/api/auth/google`;
};

const authService = {
  register,
  login,
  logout,
  getUser,
  getUserProfile,
  googleLogin,
};

export default authService;