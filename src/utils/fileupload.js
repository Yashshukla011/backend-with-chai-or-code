import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration ko try-catch ke bahar rakhein
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
console.log("Cloudinary Secret Loaded:", process.env.CLOUDINARY_API_SECRET ? "YES" : "NO");
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Uploading file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        // Success: file delete karein
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        // Fail: local file fir bhi delete karein taaki storage full na ho
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        console.error("Cloudinary Error:", error.message);
        return null;
    }
};

export { uploadOnCloudinary };