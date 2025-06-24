import axios from 'axios';

axios.defaults.withCredentials = true;

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const register = (username, email, password) => {
  return axios.post(`${BACKEND_URL}/auth/register`, { username, email, password });
};

const login = (email, password) => {
  return axios.post(`${BACKEND_URL}/auth/login`, { email, password });
};

const logout = () => {
  return axios.post(`${BACKEND_URL}/auth/logout`);
};

const getUser = () => {
  return axios.get(`${BACKEND_URL}/auth/user`);
};

const googleLogin = () => {
  window.location.href = `${BACKEND_URL}/auth/google`;
};

const authService = {
  register,
  login,
  logout,
  getUser,
  googleLogin,
};

export default authService;