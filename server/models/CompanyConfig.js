const mongoose = require('mongoose');

const companyConfigSchema = new mongoose.Schema({
    companyName: { type: String, default: 'CN Events' },
    branding: {
        logo: { type: String },
        primaryColor: { type: String, default: '#3b82f6' }
    },
    defaults: {
        currency: { type: String, default: '₹' },
        secondaryCurrency: { type: String, default: '$' },
        country: { type: String, default: 'India' }
    },
    leadSettings: {
        prioritizationRules: { type: String, default: 'First Come First Serve' }
    },
    security: {
        maintenanceMode: { type: Boolean, default: false }
    },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyConfig', companyConfigSchema);
