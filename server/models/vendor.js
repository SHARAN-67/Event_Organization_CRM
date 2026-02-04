const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contactPerson: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Catering', 'Venue', 'Audio/Visual', 'Decorations', 'Security', 'Transportation', 'Other'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Paid', 'Partial', 'Overdue', 'Pending'],
        default: 'Pending',
    },
    amountDue: {
        type: Number,
        default: 0,
    },
    amountPaid: {
        type: Number,
        default: 0,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Vendor', vendorSchema);
