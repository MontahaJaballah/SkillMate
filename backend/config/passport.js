const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/linkedin/callback",
    scope: ['openid', 'profile', 'email'],
    state: true,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('LinkedIn profile:', profile);
        
        // Check if user already exists
        let user = await User.findOne({ 'linkedinId': profile.id });

        if (user) {
            return done(null, user);
        }

        // Create new user if doesn't exist
        user = new User({
            linkedinId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName || profile.displayName.split(' ')[0],
            lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
            username: profile.emails[0].value.split('@')[0],
            role: 'student' // Default role
        });

        await user.save();
        return done(null, user);
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return done(error, null);
    }
}));
