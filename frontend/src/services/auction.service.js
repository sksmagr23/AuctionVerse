import axios from 'axios';

const API_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/auction`;

const getAllAuctions = () => {
  return axios.get(API_URL);
};

const getAuction = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

const createAuction = (auctionData) => {
  return axios.post(API_URL, auctionData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const joinAuction = (id) => {
  return axios.post(`${API_URL}/${id}/join`);
};

const endAuction = (id) => {
  return axios.post(`${API_URL}/${id}/end`);
};

const registerForAuction = (id) => {
  return axios.post(`${API_URL}/${id}/register`);
};

const getRegisteredParticipants = (id) => {
  return axios.get(`${API_URL}/${id}/registered-participants`);
};

const auctionService = {
  getAllAuctions,
  getAuction,
  createAuction,
  joinAuction,
  endAuction,
  registerForAuction,
  getRegisteredParticipants,
};

export default auctionService; 