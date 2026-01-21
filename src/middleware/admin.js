const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.isAdmin = async (req, res, next) => {
	try {
		const token = req.cookies.adminToken;

		if (!token) {
			return res.status(401).json({ message: 'Admin not logged in' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (decoded.role !== 'admin') {
			return res.status(403).json({ message: 'Access denied' });
		}

		const admin = await Admin.findById(decoded.id).select('-password');
		if (!admin) {
			return res.status(401).json({ message: 'Admin not found' });
		}

		req.admin = admin; // FULL admin object
		next();
	} catch (err) {
		console.error('Admin auth error:', err.message);
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};
