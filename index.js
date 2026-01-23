const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const userRoutes = require('./src/routes/userRoutes.js');
const adminRoutes = require('./src/routes/admin');
const carRoutes = require('./src/routes/carRoutes');
const adminRecentUser = require('./src/routes/admin');
const bookingRoutes = require('./src/routes/booking');

const path = require('path');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

// middleware
app.use(express.json());
app.use(cookieParser());

// cors
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: path.join(__dirname, 'tmp'),
		createParentPath: true,
	})
);

// connect DB
connectDB();

app.use('/api/bookings', bookingRoutes);
// routes
app.use('/api/user', userRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/cars', carRoutes);

app.use('/api/admin', adminRecentUser);

// server
app.listen(port, () => {
	console.log(`Server running on Port ${port}`);
});
