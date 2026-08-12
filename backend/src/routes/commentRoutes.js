const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const auth = require('../middleware/auth');
const { commentValidation, objectIdParam } = require('../middleware/validation');

router.post('/', auth, commentValidation, addComment);
router.get('/', getComments);
router.put('/:id', auth, objectIdParam('id'), commentValidation, updateComment);
router.delete('/:id', auth, objectIdParam('id'), deleteComment);

module.exports = router;
