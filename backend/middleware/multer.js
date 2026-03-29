import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = path.join("uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
    }
});

const upload = multer({ storage });

export default upload;