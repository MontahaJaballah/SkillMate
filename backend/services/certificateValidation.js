const path = require('path');
const fs = require('fs').promises;
const { createWorker } = require('tesseract.js');
const crypto = require('crypto');

class CertificateValidationService {
    constructor() {
        this.worker = null; // Worker will be initialized per validation
    }

    async validateCertificate(filePath, mimeType) {
        try {
            console.log('Starting certificate validation for:', filePath);

            // Check if file exists and is not empty
            await fs.access(filePath);
            const stats = await fs.stat(filePath);
            if (stats.size === 0) {
                return {
                    isValid: false,
                    message: 'Certificate file is empty',
                    status: 'invalid',
                };
            }

            // Compute file hash for debugging
            const fileBuffer = await fs.readFile(filePath);
            const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
            console.log('Certificate file hash:', fileHash);

            const ext = path.extname(filePath).toLowerCase();
            const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
            if (!validExtensions.includes(ext)) {
                return {
                    isValid: false,
                    message: 'Invalid file type. Only PDF, JPG, and PNG files are accepted.',
                    status: 'invalid',
                };
            }

            // Only process images for now (PDF support can be added later if needed)
            if (!mimeType.startsWith('image/')) {
                console.log('Skipping validation: Non-image file');
                return {
                    isValid: false,
                    message: 'Only image files are supported for now.',
                    status: 'invalid',
                };
            }

            // Initialize Tesseract worker with consistent configuration
            const worker = await createWorker('eng', undefined, {
                logger: m => console.log('Tesseract progress:', m), // Log OCR progress
            });
            const { data: { text } } = await worker.recognize(filePath);
            await worker.terminate();

            console.log('Raw extracted text from certificate:', text);

            // Normalize text for better matching (remove extra spaces, newlines, and noise)
            const normalizedText = text.replace(/[\s\n]+/g, ' ').replace(/[^a-zA-Z0-9\s:,-]/g, '').trim();

            console.log('Normalized extracted text:', normalizedText);

            // Updated validation rules
            const hasId = /(Certificat(e|ion)\s*ID\s*[:\s]*[A-Za-z0-9]+-[A-Za-z0-9]+)/i.test(normalizedText);
            const hasSignature = /\b(Signed by|Signature of):?\s*([A-Z][a-z]+ [A-Z][a-z]+,\s*[A-Za-z\s]+(President|Director|Vice President|Authority|Coach|Master))\b/i.test(normalizedText) ||
                                /\b([A-Z][a-z]+\s+[A-Z][a-z]+(?:,\s*(?:President|Director|Vice President|Authority|Coach|Master)(?:,\s*[A-Za-z\s]+)?)?)\b/i.test(normalizedText) ||
                                /\b(Coach)\s*[:\s]*[A-Z][a-z]+\s+[A-Z][a-z]+\b/i.test(normalizedText) ||
                                /\b(Signature)\b/i.test(normalizedText);
            const hasStamp = /\b(Official Stamp|Certified Stamp|Stamp of\s+[A-Za-z\s]+)\b/i.test(normalizedText);
            const hasIssueDate = /\b(Issued on|Issue Date|Date Issued|Date|Awarded on)\s*[:\s]*[A-Za-z0-9\s,\/]+\d{2,4}\b/i.test(normalizedText);
            const hasTeam = /\b(Team)\s*[:\s]*[A-Za-z\s]+\b/i.test(normalizedText);
            const hasCertificateTerm = /\b(certificate|award|awarded|diploma)\b/i.test(normalizedText);

            console.log('Validation results:', { hasId, hasSignature, hasStamp, hasIssueDate, hasTeam, hasCertificateTerm });

            // Check if the signature includes a high-authority title (e.g., Director, President, Coach, Master)
            const hasHighAuthoritySignature = /\b(President|Director|Vice President|Authority|Coach|Master)\b/i.test(normalizedText);

            // Require at least two criteria to pass, OR a high-authority signature AND an issue date,
            // OR signature (or "Signature") AND issue date AND certificate term
            const criteriaMet = [hasId, hasSignature, hasStamp, hasIssueDate, hasTeam, hasCertificateTerm].filter(Boolean).length;
            const isValid = criteriaMet >= 2 || 
                           (hasHighAuthoritySignature && hasIssueDate) || 
                           (hasSignature && hasIssueDate && hasCertificateTerm);
            const status = isValid ? 'pending' : 'invalid';
            return {
                isValid: isValid,
                message: isValid ? 'Certificate flagged for manual review' : 'Certificate appears invalid',
                fileInfo: {
                    size: stats.size,
                    type: ext,
                    path: filePath,
                    status: status,
                },
            };

        } catch (error) {
            console.error('Error in validateCertificate:', error);
            if (error.code === 'ENOENT') {
                return {
                    isValid: false,
                    message: 'Certificate file not found',
                    status: 'invalid',
                };
            }
            return {
                isValid: false,
                message: 'Error validating certificate',
                status: 'invalid',
            };
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