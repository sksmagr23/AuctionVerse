import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auctionService from '../services/auction.service';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('startingPrice', startingPrice);
    formData.append('startTime', startTime);
    if (itemImage) {
      formData.append('itemImage', itemImage);
    }

    try {
      const response = await auctionService.createAuction(formData);
      if (response.data.success) {
        navigate(`/auction/${response.data.auction._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create auction.');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Create a New Auction</h2>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startingPrice">Starting Price ($)</label>
          <input type="number" id="startingPrice" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">Start Time</label>
          <input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemImage">Item Image</label>
          <input type="file" id="itemImage" onChange={(e) => setItemImage(e.target.files[0])} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>
        
        <div className="flex items-center justify-center">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Auction</button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction; 