const fs = require('fs');
const path = require('path');

const LEGACY_UPLOAD_DIR = path.join(__dirname, '../../uploads/avatars');

const deleteLocalAvatarIfExists = (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.includes('/uploads/avatars/')) {
    return;
  }

  const filename = path.basename(avatarUrl);
  const filePath = path.join(LEGACY_UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { deleteLocalAvatarIfExists };
