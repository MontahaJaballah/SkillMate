const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        console.log('Upload directory:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    console.log('Received file:', file.originalname, file.mimetype);
    // Accept images only
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        console.log('Invalid file type:', file.mimetype);
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Configure multer
const uploadMiddleware = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Upload single file
const uploadFile = async (req, res) => {
    console.log('Upload request received');
    console.log('Request headers:', req.headers);

    uploadMiddleware.single('file')(req, res, function (err) {
        if (err) {
            console.error('Multer error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size is too large. Max size is 10MB.' });
            }
            return res.status(400).json({ message: err.message });
        }

        try {
            if (!req.file) {
                console.log('No file received in request');
                return res.status(400).json({ message: 'No file uploaded' });
            }

            console.log('File received:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            });

            // Create URL for the uploaded file
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            console.log('Generated URL:', fileUrl);

            res.status(200).json({
                message: 'File uploaded successfully',
                url: fileUrl,
                file: {
                    originalname: req.file.originalname,
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                message: 'Error uploading file',
                error: error.message
            });
        }
    });
};

module.exports = {
    uploadFile
};
