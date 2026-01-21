const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},

		year: {
			type: Number,
		},

		category: {
			type: String,
			enum: ['SUV', 'Sedan', 'Hatchback', 'MUV', 'Luxury'],
			default: 'SUV',
		},

		seats: {
			type: Number,
		},

		fuel: {
			type: String,
			enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
			default: 'Petrol',
		},

		transmission: {
			type: String,
			enum: ['Automatic', 'Manual'],
			default: 'Automatic',
		},

		price: {
			type: Number,
			required: true,
		},

		status: {
			type: String,
			enum: ['Available', 'Booked', 'Not Available'],
			default: 'Available',
		},

		description: {
			type: String,
			trim: true,
		},

		features: {
			type: [String],
			default: [],
		},

		images: {
			type: [
				{
					url: String,
					public_id: String,
				},
			],
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
module.exports = mongoose.models.Car || mongoose.model('Car', carSchema);
