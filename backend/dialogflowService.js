const dialogflow = require('@google-cloud/dialogflow');
const uuid = require("uuid");
const path = require('path');
const fs = require('fs');

// Check if required environment variables are set
const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.GOOGLE_PROJECT_ID || "skillmate-olcy";

console.log('GOOGLE_APPLICATION_CREDENTIALS:', googleCredentialsPath);
console.log('GOOGLE_PROJECT_ID:', projectId);

let sessionClient;

try {
    // Create a new session client with the project ID
    if (!googleCredentialsPath) {
        console.warn('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Dialogflow will not work properly.');
    } else {
        console.log('Initializing Dialogflow with credentials path:', googleCredentialsPath);
        
        // Check if the file exists
        if (fs.existsSync(googleCredentialsPath)) {
            console.log('Credentials file exists');
        } else {
            console.error('Credentials file does not exist at path:', googleCredentialsPath);
        }
        
        console.log('Using project ID:', projectId);
    }

    sessionClient = new dialogflow.SessionsClient({
        keyFilename: googleCredentialsPath
    });
    console.log('Dialogflow session client initialized successfully');
} catch (error) {
    console.error('Error initializing Dialogflow client:', error);
}

async function detectIntent(query, sessionId) {
    // If session client wasn't initialized properly, return a fallback message
    if (!sessionClient) {
        throw new Error('Dialogflow client is not initialized. Please check your environment variables.');
    }

    console.log(`Processing query "${query}" for session ${sessionId}`);
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: "en",
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        console.log('Dialogflow response:', result.fulfillmentText);
        return result.fulfillmentText || "I'm sorry, I didn't understand that. Could you try rephrasing?";
    } catch (error) {
        console.error('Error in detectIntent:', error);
        throw error;
    }
}

module.exports = detectIntent;
