const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Event Resource Information
    productOwner: { type: String, default: 'CN' },
    productName: { type: String, required: true }, // e.g. "JBL Speaker", "Wedding Chair", "DJ Service"
    productCode: { type: String },
    vendorName: { type: String }, // Supplier
    productActive: { type: Boolean, default: true },

    // Category & Type
    productCategory: {
        type: String,
        default: 'Equipment',
        enum: ['Equipment', 'Audio/Visual', 'Furniture', 'Decor', 'Lighting', 'Service', 'Catering', 'Venue', 'Other']
    },
    resourceType: {
        type: String,
        default: 'Owned',
        enum: ['Owned', 'Rented']
    },

    // Pricing
    unitPrice: { type: Number, default: 0 }, // Cost per unit
    pricingModel: {
        type: String,
        default: 'Per Day',
        enum: ['Per Day', 'Per Hour', 'Per Unit', 'Fixed Fee']
    },
    tax: { type: String },
    taxable: { type: Boolean, default: true },

    // Availability / Stock
    qtyInStock: { type: Number, default: 0 }, // Total available inventory

    // Description
    description: { type: String },

    // Ownership / Rental Details
    purchaseDate: { type: Date }, // For Owned items
    rentalDuration: { type: String }, // e.g. "3 Days", "1 Week" for Rented items
    lastMaintenanceDate: { type: Date },
    maintenanceStatus: {
        type: String,
        default: 'Operational',
        enum: ['Operational', 'Maintenance', 'Decommissioned']
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
