const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Section title is required'],
        trim: true
    },
    content: [{
        type: {
            type: String,
            enum: ['video', 'quiz', 'assignment'],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: Number,
            min: 0
        },
        resources: [String],
        description: String,
        videoUrl: String,
        questions: [{
            question: String,
            options: [String],
            correctAnswer: Number
        }]
    }]
});

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['regular', 'IT'],
        default: 'regular'
    },
    thumbnail: {
        type: String,
        required: [true, 'Course thumbnail is required']
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: function () {
            return this.type === 'regular';
        }
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    schedule: {
        type: String,
        required: function () {
            return this.type === 'regular';
        }
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'Course level is required']
    },
    language: {
        type: String,
        required: [true, 'Course language is required']
    },
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    sections: [sectionSchema],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    totalRating: {
        type: Number,
        default: 0
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for average rating
courseSchema.virtual('averageRating').get(function () {
    if (this.numberOfRatings === 0) return 0;
    return this.totalRating / this.numberOfRatings;
});

// Pre-save middleware to update rating stats
courseSchema.pre('save', function (next) {
    if (this.isModified('ratings')) {
        const ratings = this.ratings || [];
        this.numberOfRatings = ratings.length;
        this.totalRating = ratings.reduce((sum, item) => sum + item.rating, 0);
    }
    next();
});

module.exports = mongoose.model('Course', courseSchema);
