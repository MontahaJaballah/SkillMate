const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return !this.linkedinId && !this.googleId; // Password only required if not using social login
        },
        minlength: 6
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    phoneNumber: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^\+[1-9]\d{1,14}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number! Please use international format (e.g., +1234567890)`
        },
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    status: {
        type: String,
        enum: ['active', 'deactivated'],
        default: 'active'
    },
    verificationCode: {
        type: String,
        required: false
    },
    verificationCodeExpires: {
        type: Date,
        required: false
    },
    // Teacher specific fields
    teachingSubjects: [{
        type: String,
        enum: ['Music', 'Chess', "Rubik's Cube", 'IT', 'Gym', 'Cooking']
    }],
    certification: {
        type: String,
        // Required only if role is teacher
        required: function () {
            return this.role === 'teacher';
        }
    },
    certificationFile: {
        type: String, // This will store the file path
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockReason: {
        type: String,
        default: null
    },
    skillsInterested: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    exchanges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    profilePicture: {
        type: String,
        default: 'default-profile.jpg'
    },
    wallets: {
        type: Number,
        default: 0
    },
    linkedinId: {
        type: String,
        unique: true,
        sparse: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    displayName: {
        type: String,
        get: function () {
            return this.firstName + ' ' + this.lastName;
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
});

module.exports = mongoose.model('User', userSchema);
