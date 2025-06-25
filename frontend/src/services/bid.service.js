import axios from 'axios';

const API_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/bid`;

const placeBid = (auctionId, amount) => {
  return axios.post(`${API_URL}/${auctionId}/bid`, { amount });
};

const bidService = {
  placeBid,
};

export default bidService; 