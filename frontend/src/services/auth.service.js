import axios from 'axios';

axios.defaults.withCredentials = true; // Always send cookies

const API_URL = 'http://localhost:3000/api/auth';

const register = (username, email, password) => {
  return axios.post(`${API_URL}/register`, { username, email, password });
};

const login = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password });
};

const logout = () => {
  return axios.post(`${API_URL}/logout`);
};

const getMe = () => {
  return axios.get(`${API_URL}/me`);
};

const googleLogin = () => {
  window.location.href = `${API_URL}/google`;
};

const authService = {
  register,
  login,
  logout,
  getMe,
  googleLogin,
};

export default authService;