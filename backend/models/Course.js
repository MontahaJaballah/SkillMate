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
            min: 0,
            required: true
        },
        resources: [String],
        description: String,
        videoUrl: {
            type: String,
            required: function () {
                return this.type === 'video';
            }
        },
        videoType: {
            type: String,
            enum: ['youtube', 'upload'],
            default: 'youtube',
            validate: {
                validator: function (v) {
                    // If type is video, videoType must be set
                    // For other types, videoType is optional
                    return this.type !== 'video' || (v && ['youtube', 'upload'].includes(v));
                },
                message: 'videoType is required for video content'
            }
        },
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
    shortDescription: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['regular', 'IT'],
        default: 'regular'
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail is required']
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: function () {
            return this.type === 'regular';
        }
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    schedule: {
        type: String,
        required: function () {
            return this.type === 'flexible';
        }
    },
    duration: {
        hours: {
            type: Number,
            default: 0,
            min: 0
        },
        minutes: {
            type: Number,
            default: 0,
            min: 0,
            max: 59
        },
        totalMinutes: {
            type: Number,
            default: 0,
            min: 0
        }
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
        default: 'published'
    },
    tags: [String],
    faqs: [{
        question: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            required: true,
            trim: true
        }
    }],
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

// Pre-save middleware to calculate total duration
courseSchema.pre('save', function (next) {
    let totalMinutes = 0;

    // Sum up durations from all sections and their content
    this.sections.forEach(section => {
        section.content.forEach(item => {
            totalMinutes += item.duration || 0;
        });
    });

    // Calculate hours and remaining minutes
    this.duration = {
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
        totalMinutes: totalMinutes
    };

    next();
});

module.exports = mongoose.model('Course', courseSchema);
