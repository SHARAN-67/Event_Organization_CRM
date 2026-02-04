const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    // Invoice Information
    invoiceOwner: { type: String, default: 'CN' }, // Mocking user from screenshot
    subject: { type: String, required: true },
    invoiceNumber: { type: String }, // Optional manual or auto-gen
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    salesOrder: { type: String },
    purchaseOrder: { type: String },
    exciseDuty: { type: Number, default: 0 }, // Rs.
    status: {
        type: String,
        enum: ['Created', 'Approved', 'Sent', 'Partial', 'Paid', 'Void', 'Overdue'],
        default: 'Created'
    },
    salesCommission: { type: Number, default: 0 }, // Rs.
    accountName: { type: String },
    contactName: { type: String },
    dealName: { type: String },

    // Top-level Contact Info (for drag-and-drop list columns)
    contactEmail: { type: String },
    contactPhone: { type: String },

    // Address Information
    billingAddress: {
        country: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        lat: { type: String },
        lng: { type: String }
    },
    shippingAddress: {
        country: { type: String },
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        lat: { type: String },
        lng: { type: String }
    },

    // Invoiced Items
    items: [{
        productName: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        listPrice: { type: Number, required: true }, // Rs.
        amount: { type: Number }, // Qty * ListPrice
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number } // Amount - Discount + Tax
    }],

    // Totals
    subTotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    adjustment: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    // Other
    termsAndConditions: { type: String },
    description: { type: String },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
