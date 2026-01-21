const Booking = require('../models/Booking.js');
const Car = require('../models/Car.js');

exports.createBooking = async (req, res) => {
	try {
		const { carId, pickupLocation, dropLocation, pickupDateTime, dropDateTime } = req.body;

		const userId = req.user.id;

		const car = await Car.findById(carId);
		if (!car) {
			return res.status(404).json({ message: 'Car not found' });
		}

		//  car already marked booked
		if (car.status === 'Booked') {
			return res.status(400).json({ message: 'Car already booked' });
		}

		// Date validation
		const start = new Date(pickupDateTime);
		const end = new Date(dropDateTime);

		if (isNaN(start) || isNaN(end) || end <= start) {
			return res.status(400).json({ message: 'Invalid dates' });
		}

		//
		const existingBooking = await Booking.findOne({
			car: carId,
			status: 'confirmed',
			pickupDateTime: { $lt: end },
			dropDateTime: { $gt: start },
		});

		if (existingBooking) {
			return res.status(400).json({
				message: 'Car is already booked for the selected dates',
			});
		}

		//  Calculate days
		const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

		// Calculate amount
		const totalAmount = totalDays * Number(car.price);

		// CREATE BOOKING
		const booking = await Booking.create({
			user: userId,
			car: carId,
			pickupLocation,
			dropLocation,
			pickupDateTime,
			dropDateTime,
			totalDays,
			pricePerDay: car.price,
			totalAmount,
			status: 'confirmed',
		});

		//  MOST IMPORTANT FIX
		await Car.findByIdAndUpdate(carId, {
			status: 'Booked',
		});

		res.status(201).json({
			success: true,
			booking,
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.getAllBookings = async (req, res) => {
	try {
		const bookings = await Booking.find()
			.populate('user', 'name email') // user details
			.populate('car', 'name price') // car details
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			bookings,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
