const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    categorie: {
        type: String,
        enum: ['IT and Programming', 'Music and Instruments', 'Chess Mastery', 'Fitness and Training', 'Rubik\'s Cube'],
        required: [true, 'Category is required'],
        trim: true
    },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        required: [true, 'Proficiency level is required']
    },
    certification: {
        type: String,
        default: 'None'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

});

module.exports = mongoose.model('Skill', skillSchema);
