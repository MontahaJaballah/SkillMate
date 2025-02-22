const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
    scope: ['r_liteprofile', 'r_emailaddress'],
    state: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists
        let user = await User.findOne({ linkedinId: profile.id });
        
        if (!user) {
            // Generate random password for LinkedIn users
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            // Create new user
            user = await User.create({
                linkedinId: profile.id,
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                username: `${profile.name.givenName}${profile.id.slice(-4)}`,
                photoURL: profile.photos[0]?.value || '',
                password: hashedPassword,
                role: 'student' // Default role
            });
        }

        return done(null, user);
    } catch (error) {
        console.error('LinkedIn auth error:', error);
        return done(error);
    }
}));

module.exports = passport;
