const express = require("express");
const router = express.Router();
const { createBooking ,getAllBookings} = require("../controllers/bookingController");
const { isAuthenticated } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

router.post("/", isAuthenticated, createBooking);

// admin bookings
router.get("/admin", isAdmin, getAllBookings);

module.exports = router;


