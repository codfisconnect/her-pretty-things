import dotenv from 'dotenv';
dotenv.config();

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'yusraa-hijab',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadPreset: process.env.CLOUDINARY_PRESET || 'yusraa_hijabs_preset',
};

export const getImageUrl = (publicId: string): string => {
  if (!publicId) return '/yusraa-hero-model.jpg';
  if (publicId.startsWith('http') || publicId.startsWith('/')) return publicId;
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${publicId}`;
};
