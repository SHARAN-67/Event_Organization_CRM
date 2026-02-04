const mongoose = require('mongoose');

const ManualOverrideSchema = new mongoose.Schema({
    metricKey: {
        type: String,
        required: true,
        unique: true,
        enum: ['totalLeads', 'totalROI', 'conversionRate', 'totalEvents', 'leadSourceDist', 'successRateMetrics']
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ManualOverride', ManualOverrideSchema);
