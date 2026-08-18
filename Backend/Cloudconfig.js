const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Storage Config for Bill/Receipt Images ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "purchase-warranty-manager/bills", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "webp"],
    // resource_type "auto" allows pdf + images both
    resource_type: "auto",
  },
});

const upload = multer({ storage: storage });

module.exports = {
  cloudinary,
  upload,
};