import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { config } from '../../config/index.js';

const router = Router();

// Configure Cloudinary
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
  });
}

// Configure Multer with Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticate);

/**
 * POST /api/v1/media/upload
 * Uploads a file to Cloudinary and returns the URL.
 */
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    if (!config.CLOUDINARY_CLOUD_NAME) {
      res.status(500).json({ success: false, message: 'Cloudinary configuration is missing.' });
      return;
    }

    const uploadFromBuffer = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'chat_media', resource_type: 'auto' },
          (error, result) => {
            if (result) {
              resolve(result); // triggers when CDN confirms upload completion
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    try {
      const result = await uploadFromBuffer(req.file.buffer);
      res.status(200).json({
        success: true,
        data: {
          url: result.secure_url
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to upload to Cloudinary', error });
    }
  })
);

export default router;
