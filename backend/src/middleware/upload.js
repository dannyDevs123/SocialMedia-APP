const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'zizu_avatars',
    public_id: `${req.user._id}-${Date.now()}`,
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
  }),
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const handleAvatarUpload = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image must be 5MB or smaller',
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      console.error('Avatar upload failed:', err.message);
      return res.status(500).json({ message: 'Image upload failed' });
    }
    next();
  });
};

module.exports = { upload, handleAvatarUpload };
