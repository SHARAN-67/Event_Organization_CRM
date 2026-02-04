const mongoose = require('mongoose');

const EventAnalyticsSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    actualCost: {
        type: Number,
        required: true
    },
    satisfactionScore: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    internalNotes: {
        type: String,
        default: ''
    },
    revenue: {
        type: Number,
        default: 0
    },
    successRate: {
        type: Number, // Percentage 0-100
        default: 0
    },
    leadSource: {
        type: String,
        enum: ['Web', 'Referral', 'Social Media', 'Email', 'Other'],
        default: 'Web'
    },
    category: {
        type: String,
        enum: ['Corporate', 'Wedding', 'Concert', 'Workshop', 'Other'],
        default: 'Corporate'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('EventAnalytics', EventAnalyticsSchema);
