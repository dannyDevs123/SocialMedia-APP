const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  getUserPosts,
} = require('../controllers/postController');
const auth = require('../middleware/auth');
const { postValidation, objectIdParam } = require('../middleware/validation');

router.post('/', auth, postValidation, createPost);
router.get('/', getAllPosts);
router.get('/feed', auth, getFeed);
router.get('/user/:userId', objectIdParam('userId'), getUserPosts);
router.get('/:id', objectIdParam('id'), getPost);
router.put('/:id', auth, objectIdParam('id'), postValidation, updatePost);
router.delete('/:id', auth, objectIdParam('id'), deletePost);

module.exports = router;
