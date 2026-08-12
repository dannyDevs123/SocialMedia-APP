const express = require('express');
const router = express.Router({ mergeParams: true });
const { toggleLike, getLikes } = require('../controllers/likeController');
const auth = require('../middleware/auth');

router.post('/', auth, toggleLike);
router.get('/', getLikes);

module.exports = router;
