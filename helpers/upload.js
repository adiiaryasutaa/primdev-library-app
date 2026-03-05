import { cloudinary } from '../configs/cloudinary.config.js';

export const uploadFile = async (
  file,
  options = {
    folder: 'primdev-ic-be-2026/library-api/covers',
  },
) => {
  try {
    const result = await cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      options,
    );

    return result;
  } catch (error) {
    console.error('Error uploading image:', error);

    throw new Error('Error uploading image');
  }
};

export const getFileUrl = (publicId) => {
  return cloudinary.v2.url(publicId);
};

export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);

    return result;
  } catch (error) {
    console.error('Error deleting image:', error);

    throw new Error('Error deleting image');
  }
};
