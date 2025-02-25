const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs').promises;

class CertificateValidationService {
    constructor() {
        try {
            // Get absolute path to credentials file
            const credentialsPath = path.join(__dirname, '..', 'config', 'google-vision-credentials.json');
            console.log('Loading credentials from:', credentialsPath);

            // Initialize the client with explicit credentials
            this.client = new vision.ImageAnnotatorClient({
                keyFilename: credentialsPath
            });
            console.log('Vision API client initialized successfully');
        } catch (error) {
            console.error('Error initializing Vision API client:', error);
            throw new Error('Failed to initialize Google Vision API client: ' + error.message);
        }
    }

    async validateCertificate(imagePath) {
        try {
            console.log('Starting certificate validation for:', imagePath);
            
            // Check if file exists
            await fs.access(imagePath);
            
            // Detect text in the image
            console.log('Calling Vision API for text detection...');
            const [result] = await this.client.textDetection(imagePath);
            
            if (!result || !result.textAnnotations || result.textAnnotations.length === 0) {
                console.log('No text detected in the image');
                return {
                    isValid: false,
                    message: 'No text detected in the certificate'
                };
            }

            const detectedText = result.textAnnotations[0].description.toLowerCase();
            console.log('Detected text:', detectedText);
            
            // Basic validation criteria - check for common certificate keywords
            const certificateKeywords = [
                'certificate', 'certification', 'diploma', 'degree',
                'awarded', 'completed', 'granted',
                'university', 'college', 'institute',
                'cisco', 'microsoft', 'nvidia', 'google', 'aws', 'azure',
                'achievement', 'completion', 'certified'
            ];

            const foundKeywords = certificateKeywords.filter(keyword => 
                detectedText.includes(keyword.toLowerCase())
            );

            console.log('Found keywords:', foundKeywords);

            if (foundKeywords.length === 0) {
                return {
                    isValid: false,
                    message: 'Document does not appear to be a valid certificate',
                    detectedText: detectedText
                };
            }

            return {
                isValid: true,
                message: 'Certificate appears to be valid',
                detectedText: detectedText,
                foundKeywords: foundKeywords
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
