import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auctionService from '../services/auction.service';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { FaGavel, FaTag, FaFileAlt, FaRupeeSign, FaClock, FaImage } from 'react-icons/fa';
import { RiAuctionFill } from "react-icons/ri";
import { useSnackbar } from 'notistack';

const CreateAuction = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [minTime, setMinTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setMinTime(`${year}-${month}-${day}T${hours}:${minutes}`);

    document.querySelectorAll('.animate-on-load').forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('opacity-0');
        el.classList.remove('translate-y-2');
      }, 100 * i);
    });
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
        enqueueSnackbar('Auction scheduled successfully!', {
          variant: 'success',
          preventDuplicate: true
        });
        navigate(`/auction/${response.data.auction._id}`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Could not create auction.';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        preventDuplicate: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-auto flex items-start justify-center bg-gradient-to-b from-[#fac311] to-transparent px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6 animate-on-load opacity-0 translate-y-2 transition-all duration-500">
          <span className="text-3xl md:text-4xl font-bold text-[#14213D] justify-center items-center gap-1 flex mb-3"> <RiAuctionFill className='w-7 h-7 md:w-8 md:h-8' /> Host an Auction</span>
          <p className="text-gray-900 text-md md:text-lg">Create a new auction and start receiving bids</p>
        </div>

        <div className="bg-gradient-to-b to-[#f5f1f1] from-white rounded-sm border-2 border-[#000] shadow-[12px_12px_0px_#000] p-6 transition-all duration-200 animate-on-load opacity-0 translate-y-2 mb-10" style={{ transitionDelay: '100ms' }}>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="title"
              type="text"
              label="Auction Title"
              icon={<FaTag />}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a catchy title for your auction"
              required
              disabled={isSubmitting}
              style={{ transitionDelay: '100ms' }}
            />

            <div className="animate-on-load opacity-0 translate-y-2 transition-all duration-200" style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center mb-2">
                <span className="mr-2 text-[#FCA311]"><FaFileAlt /></span>
                <label className="text-[#14213D] text-sm font-bold" htmlFor="description">
                  Description
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item in detail"
                  className="w-full px-3 py-2.5 rounded-sm border border-[#2e2e2ee9] shadow-[3px_0px_3px_#2e2e2ee9] focus:outline-none focus:shadow-[3px_0px_3px_#fca311] focus:border-[#FCA311] focus:ring-2 focus:ring-[#FCA311]/20 transition-all duration-200"
                  rows={4}
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>

            <FormInput
              id="basePrice"
              type="number"
              label="Base Price"
              icon={<FaRupeeSign />}
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="Set your starting bid amount"
              required
              disabled={isSubmitting}
              style={{ transitionDelay: '300ms' }}
            />

            <FormInput
              id="startTime"
              type="datetime-local"
              label="Auction Start Time"
              icon={<FaClock />}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={minTime}
              required
              disabled={isSubmitting}
              style={{ transitionDelay: '400ms' }}
            />

            <div className="animate-on-load opacity-0 translate-y-2 transition-all duration-200" style={{ transitionDelay: '500ms' }}>
              <div className="flex items-center mb-2">
                <span className="mr-2 text-[#FCA311]"><FaImage /></span>
                <label className="text-[#14213D] text-sm font-bold" htmlFor="itemImage">
                  Item Image
                </label>
              </div>

              <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 transition-all hover:border-[#FCA311]">
                <input
                  type="file"
                  id="itemImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="itemImage"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-48 object-contain rounded-md"
                      />
                      
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <FaImage className="w-12 h-12 text-[#fca311] mb-3" />
                      <p className="mb-2 text-sm text-[#222]">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-[#222]">PNG, JPG, SVG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="animate-on-load opacity-0 translate-y-2 transition-all duration-200" style={{ transitionDelay: '600ms' }}>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
                icon={<FaGavel />}
              >
                {isSubmitting ? 'Creating Auction...' : 'Create Auction'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;