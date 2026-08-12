const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
} = require('../middleware/validation');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfileValidation, updateProfile);

module.exports = router;
