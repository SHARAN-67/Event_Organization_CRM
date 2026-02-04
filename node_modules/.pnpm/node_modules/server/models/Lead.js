const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    status: {
        type: String,
        default: 'New'
    },
    value: { type: String }, // Storing as string to match current UI '$10,000', generally better as Number but keeping simplified for now unless requested
    owner: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    source: { type: String, default: 'Web' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
