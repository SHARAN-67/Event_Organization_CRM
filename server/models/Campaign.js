const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: {
        type: String,
        enum: ['Active', 'Scheduled', 'Completed', 'Draft'],
        default: 'Draft'
    },
    reach: { type: String, default: '0' },
    roi: { type: String, default: '0%' },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, default: 0 },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
