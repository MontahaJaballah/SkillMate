const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    // Course model attributes will go here
});

module.exports = mongoose.model('Course', courseSchema);
