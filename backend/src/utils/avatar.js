const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../middleware/upload');

const buildAvatarUrl = (req, filename) => {
  const avatarPath = `/uploads/avatars/${filename}`;
  return `${req.protocol}://${req.get('host')}${avatarPath}`;
};

const deleteLocalAvatarIfExists = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.includes('/uploads/avatars/')) {
    return;
  }

  const filename = path.basename(avatarUrl);
  const filePath = path.join(uploadDir, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { buildAvatarUrl, deleteLocalAvatarIfExists };
