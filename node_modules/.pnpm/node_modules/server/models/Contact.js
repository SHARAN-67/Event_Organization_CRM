const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    phone_number: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'attendee'
    },
    checkInStatus: {
        type: String,
        enum: ['checked-in', 'not-checked-in', 'no-ticket'],
        default: 'no-ticket'
    },
    events: [{
        type: String // Storing event names or IDs as strings for now
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
