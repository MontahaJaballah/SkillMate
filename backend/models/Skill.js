const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    // Skill model attributes will go here
});

module.exports = mongoose.model('Skill', skillSchema);
