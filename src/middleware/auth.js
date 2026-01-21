const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
	const token = req.cookies.userToken; // cookie instead of localStorage

	if (!token) return res.status(401).json({ message: 'Login required', loginStatus: false });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // attach user info to request
		next();
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
};
