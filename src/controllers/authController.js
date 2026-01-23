const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// REGISTER
exports.register = async (req, res) => {
	const { name, email, password, phone } = req.body;

	const userExists = await User.findOne({ email });
	if (userExists) {
		return res.status(400).json({ message: 'User already exists' });
	}

	const user = await User.create({ name, email, password, phone });

	res.status(201).json({ message: 'User registered successfully' });
};

// LOGIN
exports.login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}

	const isMatch = await user.comparePassword(password);
	if (!isMatch) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}

	const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	});

	res.cookie('userToken', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production', // only secure in prod
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.json({ message: 'Login successful' });
};

// LOGOUT
exports.logout = (req, res) => {
	res.clearCookie('userToken', {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
	});

	res.json({ message: 'Logged out successfully' });
};
exports.forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// create reset token
		const resetToken = crypto.randomBytes(32).toString('hex');

		// hash token before saving
		user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
		user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

		await user.save();

		const resetLink = `http://localhost:5173/user/reset-password?token=${resetToken}`;

		// send email safely
		try {
			await sendEmail(
				user.email,
				'Password Reset Request',
				`Click the link to reset your password:\n\n${resetLink}\n\nThis link expires in 15 minutes.`
			);
		} catch (emailErr) {
			console.error('Email sending failed:', emailErr);
			return res.status(500).json({ message: 'Failed to send email. Check server logs.' });
		}

		res.json({ message: 'Password reset link sent to email' });
	} catch (err) {
		console.error('Forgot password error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};

exports.resetPassword = async (req, res) => {
	const { token, password } = req.body;

	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

	const user = await User.findOne({
		resetPasswordToken: hashedToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return res.status(400).json({ message: 'Token invalid or expired' });
	}

	user.password = password; // hashed by pre-save hook
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	res.json({ message: 'Password reset successful' });
};
exports.isLoggedIn = (req, res) => {
	return res.status(200).json({ message: 'success', loginStatus: true });
};
