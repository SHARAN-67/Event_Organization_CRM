const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    capacity: {
        totalCapacity: {
            type: Number,
            default: 0
        },
        seatedCapacity: {
            type: Number,
            default: 0
        },
        standingCapacity: {
            type: Number,
            default: 0
        }
    },
    amenities: [{
        type: String
    }],
    description: {
        type: String
    },
    thumbnail: {
        type: String // Path to uploaded image
    },
    images: [{
        type: String // Multiple images
    }],
    floorPlans: [{
        name: String,
        imageParams: String // Path to image
    }],
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Venue', venueSchema);
