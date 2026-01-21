const Car = require('../models/Car.js');
const Booking = require('../models/Booking.js');
const cloudinary = require('../config/cloudinary');

exports.addCar = async (req, res) => {
	try {
		const {
			name,
			year,
			category,
			seats,
			fuel,
			transmission,
			price,
			status,
			description,
			features,
		} = req.body;

		if (!req.files || !req.files.images) {
			return res.status(400).json({ message: 'At least one image is required' });
		}

		let images = req.files.images;

		// Convert single image to array
		if (!Array.isArray(images)) {
			images = [images];
		}

		const uploadedImages = [];

		for (const file of images) {
			const result = await cloudinary.uploader.upload(file.tempFilePath, { folder: 'rentro/cars' });

			uploadedImages.push({
				url: result.secure_url,
				public_id: result.public_id,
			});
		}

		const parsedFeatures = Array.isArray(features) ? features : features ? [features] : [];

		const car = await Car.create({
			name,
			year,
			category,
			seats,
			fuel,
			transmission,
			price,
			status,
			description,
			features: parsedFeatures,
			images: uploadedImages,
		});

		res.status(201).json({
			success: true,
			message: 'Car added successfully',
			car,
		});
	} catch (error) {
		console.error('ADD CAR ERROR:', error);
		res.status(500).json({ message: error.message });
	}
};

// recently added cars
exports.getRecentCars = async (req, res) => {
	try {
		const cars = await Car.find()
			.sort({ createdAt: -1 }) // newest first
			.limit(5); // show only recent cars

		res.status(200).json({
			success: true,
			cars,
		});
	} catch (error) {
		console.error('GET RECENT CARS ERROR:', error);
		res.status(500).json({ message: 'Server Error' });
	}
};

//managecars

exports.getAllCars = async (req, res) => {
	const cars = await Car.find().sort({ createdAt: -1 });

	const carsWithReturnDate = await Promise.all(
		cars.map(async (car) => {
			let returnDate = null;

			if (car.status === 'Booked') {
				const booking = await Booking.findOne({
					car: car._id,
					status: 'confirmed',
				}).sort({ dropDateTime: -1 });

				if (booking) {
					returnDate = booking.dropDateTime;
				}
			}

			return {
				...car.toObject(),
				returnDate,
			};
		})
	);

	res.json({
		success: true,
		cars: carsWithReturnDate,
	});
};

//deletecars

exports.deleteCar = async (req, res) => {
	try {
		const car = await Car.findById(req.params.id);

		if (!car) {
			return res.status(404).json({ message: 'Car not found' });
		}

		//  Delete ALL images from Cloudinary
		if (car.images && car.images.length) {
			for (const img of car.images) {
				await cloudinary.uploader.destroy(img.public_id);
			}
		}
		// Delete car from DB
		await car.deleteOne();

		res.status(200).json({
			success: true,
			message: 'Car deleted successfully',
		});
	} catch (error) {
		console.error('DELETE CAR ERROR:', error);
		res.status(500).json({ message: error.message });
	}
};

exports.updateCar = async (req, res) => {
	try {
		const car = await Car.findById(req.params.id);
		if (!car) {
			return res.status(404).json({ message: 'Car not found' });
		}

		// Build update object safely
		const updateData = {};

		Object.keys(req.body).forEach((key) => {
			if (req.body[key] !== '') {
				updateData[key] = req.body[key];
			}
		});

		// Handle features array
		if (req.body['features[]']) {
			updateData.features = Array.isArray(req.body['features[]'])
				? req.body['features[]']
				: [req.body['features[]']];
		}

		//  Image update (optional)
		if (req.files && req.files.image) {
			// delete old image
			await cloudinary.uploader.destroy(car.image.public_id);

			const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
				folder: 'rentro/cars',
			});

			updateData.image = {
				url: result.secure_url,
				public_id: result.public_id,
			};
		}

		const updatedCar = await Car.findByIdAndUpdate(
			req.params.id,
			{ $set: updateData },
			{ new: true }
		);

		res.json({
			success: true,
			message: 'Car updated successfully',
			car: updatedCar,
		});
	} catch (error) {
		console.error('UPDATE CAR ERROR:', error);
		res.status(500).json({ message: error.message });
	}
};

exports.getSingleCar = async (req, res) => {
	try {
		const car = await Car.findById(req.params.id);

		if (!car) {
			return res.status(404).json({ message: 'Car not found' });
		}

		res.json({
			success: true,
			car,
		});
	} catch (error) {
		console.error('GET SINGLE CAR ERROR:', error);
		res.status(500).json({ message: error.message });
	}
};

exports.getCarStats = async (req, res) => {
	try {
		const totalCars = await Car.countDocuments();

		const availableCars = await Car.countDocuments({
			status: 'Available',
		});

		const bookedCars = await Car.countDocuments({
			status: 'Booked',
		});

		res.json({
			success: true,
			stats: {
				totalCars,
				availableCars,
				bookedCars,
			},
		});
	} catch (error) {
		console.error('CAR STATS ERROR:', error);
		res.status(500).json({ message: error.message });
	}
};

// redirect  cars details page

exports.getCarById = async (req, res) => {
	try {
		const car = await Car.findById(req.params.id);

		if (!car) {
			return res.status(404).json({ message: 'Car not found' });
		}

		res.status(200).json({
			success: true,
			car,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
