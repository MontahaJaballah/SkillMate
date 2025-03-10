const dialogflow = require('@google-cloud/dialogflow');
const uuid = require("uuid");
const path = require('path');
const fs = require('fs');

// Set the credentials path to always use skillmateBot.json
const googleCredentialsPath = path.resolve(__dirname, '..', 'config', 'skillmateBot.json');
const projectId = process.env.GOOGLE_PROJECT_ID || "skillmate-olcy";

console.log('Using Dialogflow credentials path:', googleCredentialsPath);
console.log('Using project ID:', projectId);

let sessionClient;

try {
    // Check if the credentials file exists
    if (!fs.existsSync(googleCredentialsPath)) {
        throw new Error(`Dialogflow credentials file not found at: ${googleCredentialsPath}`);
    }

    // Create a new session client with the project ID
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
        throw new Error('Dialogflow client is not initialized. Please check your credentials file.');
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
