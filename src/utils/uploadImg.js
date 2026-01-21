const cloudinary = require('cloudinary').v2;

const uploadImageToCloudinary = async (file, width, height, folder) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			folder: folder,
			width: width,
			height: height,
			crop: 'fill',
			gravity: 'face',
		});
		return { url: result.secure_url, public_id: result.public_id };
	} catch (error) {
		throw new Error(`Error uploading image to Cloudinary: ${error.message}`);
	}
};
module.exports = uploadImageToCloudinary;
