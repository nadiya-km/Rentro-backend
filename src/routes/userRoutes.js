const express = require('express');
const router = express.Router();
const {
	login,
	register,
	logout,
	forgotPassword,
	resetPassword,
	isLoggedIn,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
// forgot password
router.post('/forgot-password', forgotPassword);

// reset password
router.post('/reset-password', resetPassword);

//check
router.get('/check-auth', isAuthenticated, (req, res) => {
	res.json({ user: req.user });
});
router.get('/login-status', isAuthenticated, isLoggedIn);
router.get('/profile', isAuthenticated, (req, res) => {
	res.json({
		message: 'User profile',
		user: req.user,
	});
});
module.exports = router;
