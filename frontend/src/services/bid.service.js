import axios from 'axios';

const API_URL = 'http://localhost:3000/api/bid';

const placeBid = (auctionId, amount) => {
  return axios.post(`${API_URL}/${auctionId}/bid`, { amount });
};

const bidService = {
  placeBid,
};

export default bidService; 