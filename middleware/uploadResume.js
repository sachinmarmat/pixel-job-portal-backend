// middleware/uploadResume.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job_portal_resumes", // Cloudinary folder
     resource_type: "raw",
    allowed_formats: ["pdf", "doc", "docx"], // restrict file types
    public_id: (req, file) => {
      const uniqueName = `${Date.now()}-${file.originalname.split(".")[0]}`;
      return uniqueName;
    },
  },
});

const upload = multer({ storage });

module.exports = upload;
