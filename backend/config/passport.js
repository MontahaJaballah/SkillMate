const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/linkedin/callback",
    scope: ['openid', 'profile', 'email'],
    state: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ linkedinId: profile.id });
        
        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const profilePicUrl = profile.photos?.[0]?.value;
            let photoURL = '';
            
            if (profilePicUrl) {
                try {
                    const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
                    const fileName = `linkedin-${profile.id}-${Date.now()}.jpg`;
                    const uploadDir = path.join(__dirname, '../uploads/photos');
                    const filePath = path.join(uploadDir, fileName);
                    
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    
                    fs.writeFileSync(filePath, response.data);
                    photoURL = `uploads/photos/${fileName}`;
                    console.log('LinkedIn profile picture saved:', photoURL);
                } catch (error) {
                    console.error('Error saving LinkedIn profile picture:', error);
                    photoURL = 'uploads/photos/default-avatar.png';
                }
            } else {
                photoURL = 'uploads/photos/default-avatar.png';
            }
            
            const baseUsername = profile.name.givenName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const username = `${baseUsername}${randomSuffix}`;

            user = await User.create({
                linkedinId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                username: username,
                photoURL: photoURL,
                password: hashedPassword,
                role: 'student' // Default role
            });

            console.log('New user created:', {
                id: user._id,
                username: user.username,
                email: user.email,
                photoURL: user.photoURL
            });
        }

        return done(null, user);
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return done(error);
    }
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback",
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const profilePicUrl = profile.photos?.[0]?.value;
            let photoURL = '';
            
            if (profilePicUrl) {
                try {
                    const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
                    const fileName = `google-${profile.id}-${Date.now()}.jpg`;
                    const uploadDir = path.join(__dirname, '../uploads/photos');
                    const filePath = path.join(uploadDir, fileName);
                    
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    
                    fs.writeFileSync(filePath, response.data);
                    photoURL = `uploads/photos/${fileName}`;
                    console.log('Google profile picture saved:', photoURL);
                } catch (error) {
                    console.error('Error saving Google profile picture:', error);
                    photoURL = 'uploads/photos/default-avatar.png';
                }
            } else {
                photoURL = 'uploads/photos/default-avatar.png';
            }

            const baseUsername = profile.displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const username = `${baseUsername}${randomSuffix}`;

            user = await User.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                username: username,
                photoURL: photoURL,
                password: hashedPassword,
                role: 'student' // Default role
            });

            console.log('New user created:', {
                id: user._id,
                username: user.username,
                email: user.email,
                photoURL: user.photoURL
            });
        }

        return done(null, user, { isNewUser });
    } catch (error) {
        console.error('Google auth error:', error);
        return done(error);
    }
}));

module.exports = passport;
