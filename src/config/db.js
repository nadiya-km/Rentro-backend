const mongoose = require('mongoose');
async function connectDB() {
	try {
		await mongoose.connect(process.env.mongo_uri);
		console.log('mongoDB connected successfuly!');
	} catch (e) {
		console.log('mongoDB connection falied!');
		console.log(e);
	}
}
module.exports = connectDB;
