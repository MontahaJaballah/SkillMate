const mongoose = require('mongoose');

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
    skill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: function() {
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
        required: function() {
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
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            min: 0,
            max: 5
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    },
    lessons: [{
        title: String,
        content: String,
        duration: Number,
        codeChallenge: {
            description: String,
            testCases: [{
                input: String,
                expectedOutput: String
            }],
            solution: String
        }
    }],
    quiz: {
        questions: [{
            description: String,
            testCases: [{
                input: String,
                expectedOutput: String
            }],
            solution: String
        }]
    },
    finalExam: {
        description: String,
        testCases: [{
            input: String,
            expectedOutput: String
        }],
        solution: String
    },
    createdate: {
        type: Date,
        default: Date.now
    }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
