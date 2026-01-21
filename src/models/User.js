const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		// user: {
		// 	name: 'string',
		// 	id: 'string',
		// 	location: 'string',
		// 	email,
		// 	passewrd,
		// 	Role,
		// 	created,
		// },
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: false, // optional
		},
		role: {
			type: String,
			enum: ['admin', 'user'],
			default: 'user',
		}, // (optionl) location,
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		status: {
			type: String,
			enum: ['Active', 'Blocked'],
			default: 'Active',
		},
	},
	{ timestamps: true }
);

//  hash password before save
userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

//  compare password for login
userSchema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
