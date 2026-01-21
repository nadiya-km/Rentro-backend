const express = require('express');
const router = express.Router();

const {
	adminLogin,
	adminLogout,
	getRecentUsers,
	getUserStats,
	getAllUsers,
	deleteUser,
	getRevenueStats,
} = require('../controllers/admin');

const { isAdmin } = require('../middleware/admin');

// auth routes
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

router.get('/check-auth', isAdmin, (req, res) => {
	res.status(200).json({ ok: true });
});

router.get('/dashboard', isAdmin, (req, res) => {
	res.json({ message: `Welcome ${req.admin.name}` });
});

//  all users (for manage users page)
router.get('/users', isAdmin, getAllUsers);

//  recent users (dashboard)
router.get('/users/recent', isAdmin, getRecentUsers);

//  user count
router.get('/users/stats', isAdmin, getUserStats);

//  delete user
router.delete('/users/:id', isAdmin, deleteUser);
// get revenue
router.get('/revenue', isAdmin, getRevenueStats);

module.exports = router;
