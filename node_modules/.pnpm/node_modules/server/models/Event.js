const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required']
    },
    description: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    venue: {
        type: String,
        required: [true, 'Venue is required']
    },
    status: {
        type: String,
        enum: ['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    eventType: {
        type: String,
        enum: ['Venue Visit', 'AV Setup', 'Meeting', 'Deadline'],
        default: 'Venue Visit'
    },
    budget: {
        type: Number,
        default: 0
    },
    amountSpent: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);
