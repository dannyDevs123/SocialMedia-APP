const express = require('express');
const router = express.Router();
const {
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getSuggestions,
} = require('../controllers/followController');
const auth = require('../middleware/auth');
const { objectIdParam } = require('../middleware/validation');

router.get('/suggestions', auth, getSuggestions);
router.post('/:userId/follow', auth, objectIdParam('userId'), toggleFollow);
router.get('/:userId/followers', objectIdParam('userId'), getFollowers);
router.get('/:userId/following', objectIdParam('userId'), getFollowing);
router.get('/:userId/follow-status', auth, objectIdParam('userId'), getFollowStatus);

module.exports = router;
