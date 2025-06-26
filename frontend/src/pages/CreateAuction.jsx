import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auctionService from '../services/auction.service';
import Button from '../components/Button';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [minTime, setMinTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMinTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setItemImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('basePrice', basePrice);
    formData.append('startTime', new Date(startTime).toISOString());
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl border-2 border-[#FCA311]">
        <div className="bg-[#FCA311] rounded-t-2xl px-8 py-5 flex items-center gap-3">
          <img src="/auction.png" className="h-8 w-8" alt="Auction" />
          <h2 className="text-2xl font-extrabold text-[#14213D]">Create a New Auction</h2>
        </div>
        <div className="px-8 pt-6 pb-8">
          {error && <p className="bg-red-100 border border-red-300 text-red-700 text-sm rounded px-4 py-2 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="title">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200" />
          </div>

          <div className="mb-4">
            <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200" rows={3}></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="basePrice">Base Price ($)</label>
            <input type="number" id="basePrice" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200" />
          </div>

          <div className="mb-4">
            <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="startTime">Start Time</label>
            <input type="datetime-local" id="startTime" value={startTime} min={minTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200" />
          </div>

          <div className="mb-6">
            <label className="block text-[#14213D] text-sm font-bold mb-2" htmlFor="itemImage">Item Image</label>
            <input type="file" id="itemImage" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200" />
            {imagePreview && (
              <div className="mt-3 flex justify-center">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-lg border border-gray-200 shadow" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <Button type="submit" variant="primary" className="w-full text-lg py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Auction'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction; 