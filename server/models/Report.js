const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reportTitle: {
        type: String,
        required: true
    },
    period: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Financial', 'Operational', 'Satisfaction', 'Growth', 'Security'],
        default: 'Operational'
    },
    metrics: [{
        label: { type: String, required: true },
        value: { type: String, required: true },
        trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' }
    }],
    status: {
        type: String,
        enum: ['Verified', 'Pending', 'Warning', 'Archive'],
        default: 'Pending'
    },
    generatedBy: {
        type: String,
        default: 'System Administrator'
    },
    fileName: { type: String },
    fileData: { type: Buffer },
    contentType: { type: String },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
