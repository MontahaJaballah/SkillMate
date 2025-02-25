const CertificateValidationService = require('../services/certificateValidation');
const path = require('path');

const certificateValidator = new CertificateValidationService();

exports.validateCertificate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No certificate file uploaded'
            });
        }

        console.log('Processing certificate:', req.file.path);
        console.log('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        const result = await certificateValidator.validateCertificate(req.file.path);
        console.log('Validation result:', result);
        
        // Clean up the uploaded file
        await certificateValidator.cleanupFile(req.file.path);

        if (!result.isValid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        res.status(200).json({
            success: true,
            message: result.message,
            detectedText: result.detectedText
        });

    } catch (error) {
        console.error('Certificate validation error:', error);
        console.error('Error stack:', error.stack);
        
        // Check for specific error types
        if (error.code === 'ENOENT') {
            return res.status(400).json({
                success: false,
                message: 'File not found or access denied'
            });
        }
        
        if (error.message.includes('The request contains an invalid argument')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format or corrupted file'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error processing certificate',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
