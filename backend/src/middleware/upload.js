const multer = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const POST_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const memoryStorage = multer.memoryStorage();

const getUploadErrorMessage = (fieldName, err) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fieldName === 'avatar'
        ? 'Avatar images must be 5MB or smaller'
        : 'Post media must be 50MB or smaller';
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return 'Only one file can be uploaded at a time';
    }

    return err.message;
  }

  return err?.message || 'File upload failed';
};

const createUploadMiddleware = ({ fieldName, allowedMimeTypes, maxFileSize }) => {
  const uploader = multer({
    storage: memoryStorage,
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
    fileFilter: (_req, file, cb) => {
      if (allowedMimeTypes.has(file.mimetype)) {
        return cb(null, true);
      }

      if (fieldName === 'avatar') {
        return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
      }

      return cb(
        new Error('Invalid file type. Only JPEG, PNG, WebP, MP4, WEBM, and MOV files are allowed.'),
        false
      );
    },
  }).single(fieldName);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) {
        const message = getUploadErrorMessage(fieldName, err);
        const statusCode = err instanceof multer.MulterError || err.message ? 400 : 500;

        if (fieldName === 'avatar') {
          return res.status(statusCode).json({
            success: false,
            message,
          });
        }

        return res.status(statusCode).json({
          success: false,
          message,
        });
      }

      next();
    });
  };
};

const handleAvatarUpload = createUploadMiddleware({
  fieldName: 'avatar',
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSize: MAX_IMAGE_SIZE,
});

const handlePostMediaUpload = createUploadMiddleware({
  fieldName: 'media',
  allowedMimeTypes: POST_MIME_TYPES,
  maxFileSize: MAX_VIDEO_SIZE,
});

const uploadBufferToCloudinary = (file, options = {}) => {
  if (!file?.buffer) {
    return Promise.resolve(null);
  }

  const {
    folder,
    publicId,
    resourceType = 'auto',
    transformation,
    tags,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        transformation,
        tags,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

module.exports = {
  handleAvatarUpload,
  handlePostMediaUpload,
  uploadBufferToCloudinary,
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
  POST_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
};
