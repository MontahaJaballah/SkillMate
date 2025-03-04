const path = require('path');
const fs = require('fs').promises;

class CertificateValidationService {
    constructor() {
        // No initialization needed
    }

    async validateCertificate(imagePath) {
        try {
            console.log('Starting certificate validation for:', imagePath);
            
            // Check if file exists
            await fs.access(imagePath);
            
            // Get file stats
            const stats = await fs.stat(imagePath);
            
            // Basic file validation
            if (stats.size === 0) {
                return {
                    isValid: false,
                    message: 'Certificate file is empty'
                };
            }

            // Check file extension
            const ext = path.extname(imagePath).toLowerCase();
            const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
            
            if (!validExtensions.includes(ext)) {
                return {
                    isValid: false,
                    message: 'Invalid file type. Only PDF, JPG, and PNG files are accepted.'
                };
            }

            // If all checks pass, consider the file valid
            return {
                isValid: true,
                message: 'Certificate file uploaded successfully',
                fileInfo: {
                    size: stats.size,
                    type: ext,
                    path: imagePath
                }
            };

        } catch (error) {
            console.error('Error in validateCertificate:', error);
            if (error.code === 'ENOENT') {
                throw new Error('Certificate file not found');
            }
            throw error;
        }
    }

    async cleanupFile(filePath) {
        try {
            await fs.unlink(filePath);
            console.log('Cleaned up file:', filePath);
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    }
}

module.exports = CertificateValidationService;
