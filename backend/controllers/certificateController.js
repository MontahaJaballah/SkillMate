const CertificateValidationService = require('../services/certificateValidation');
const validator = new CertificateValidationService();

exports.validateCertificate = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
            });
        }

        const validationResult = await validator.validateCertificate(req.file.path, req.file.mimetype);
        
        if (!validationResult.isValid) {
            await validator.cleanupFile(req.file.path);
            return res.status(400).json({
                success: false,
                error: validationResult.message,
                status: validationResult.status,
            });
        }

        res.json({
            success: true,
            message: validationResult.message,
            fileInfo: validationResult.fileInfo,
        });
    } catch (error) {
        console.error('Certificate validation error:', error);
        if (req.file) {
            await validator.cleanupFile(req.file.path);
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Error validating certificate',
        });
    }
};
