// utils/cloudinary.js
const cloudinary = require("cloudinary").v2;

// ✅ Load environment variables safely
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,     // ✅ clearer variable name
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // ✅ ensures HTTPS URLs
});

module.exports = cloudinary;
