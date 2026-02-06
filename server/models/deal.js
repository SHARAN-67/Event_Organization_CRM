const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    value: {
        type: Number, // Budget
        required: true,
    },
    stage: {
        type: String,
        default: 'Prospecting',
        required: true,
    },
    contact: {
        type: String, // Keeping for backward compatibility or can serve as "Point of Contact"
        required: false,
    },
    date: {
        type: Date,
    },
    attendees: {
        type: Number,
    },
    venue: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    changeLog: [{
        timestamp: { type: Date, default: Date.now },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changes: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Deal', dealSchema);
