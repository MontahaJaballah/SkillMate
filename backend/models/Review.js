const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Review model attributes will go here
});

module.exports = mongoose.model('Review', reviewSchema);
