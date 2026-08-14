const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const formatUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

const formatPostResponse = (post) => {
  return {
    _id: post._id,
    content: post.content,
    imageUrl: post.imageUrl,
    mediaUrl: post.mediaUrl || post.imageUrl || '',
    mediaType: post.mediaType || (post.mediaUrl || post.imageUrl ? 'image' : ''),
    mediaPublicId: post.mediaPublicId || '',
    user: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

module.exports = {
  isValidObjectId,
  formatUserResponse,
  formatPostResponse,
};
