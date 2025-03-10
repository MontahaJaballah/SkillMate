// In a production environment, you would use a real SMS service like Twilio
// For development, we'll just log the messages
const sendSMS = async (phoneNumber, message) => {
    // Log the SMS details for development
    console.log('\n=== SMS Service (Development Mode) ===');
    console.log('To:', phoneNumber);
    console.log('Message:', message);
    console.log('=====================================\n');

    // In development, simulate a successful send
    return {
        success: true,
        sid: 'DEV_' + Math.random().toString(36).substring(7)
    };
};

module.exports = {
    sendSMS
};
