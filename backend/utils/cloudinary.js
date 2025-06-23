import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath, folder = 'auctionverse') => {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
};

export default cloudinary; 