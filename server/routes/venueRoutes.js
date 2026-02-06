const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/venues/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'venue-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all venues
router.get('/', async (req, res) => {
    try {
        const venues = await Venue.find().sort({ createdAt: -1 });
        res.json(venues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single venue
router.get('/:id', async (req, res) => {
    try {
        const venue = await Venue.findById(req.params.id);
        if (!venue) return res.status(404).json({ message: 'Venue not found' });
        res.json(venue);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Create venue
router.post('/', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    try {
        const venueData = req.body;

        // Parse nested objects if they are sent as JSON strings (common with FormData)
        if (typeof venueData.capacity === 'string') {
            try { venueData.capacity = JSON.parse(venueData.capacity); } catch (e) { }
        }
        if (typeof venueData.contactInfo === 'string') {
            try { venueData.contactInfo = JSON.parse(venueData.contactInfo); } catch (e) { }
        }
        if (typeof venueData.amenities === 'string') {
            try { venueData.amenities = JSON.parse(venueData.amenities); } catch (e) { }
        }

        if (req.files['thumbnail']) {
            venueData.thumbnail = req.files['thumbnail'][0].path;
        }

        if (req.files['images']) {
            venueData.images = req.files['images'].map(file => file.path);
        }

        const venue = new Venue(venueData);
        const newVenue = await venue.save();
        res.status(201).json(newVenue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update venue
router.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    try {
        const venueData = req.body;

        // Parse nested objects likely sent as JSON strings
        if (typeof venueData.capacity === 'string') {
            try { venueData.capacity = JSON.parse(venueData.capacity); } catch (e) { }
        }
        if (typeof venueData.contactInfo === 'string') {
            try { venueData.contactInfo = JSON.parse(venueData.contactInfo); } catch (e) { }
        }
        if (typeof venueData.amenities === 'string') {
            try { venueData.amenities = JSON.parse(venueData.amenities); } catch (e) { }
        }
        if (typeof venueData.existingImages === 'string') {
            try {
                const existing = JSON.parse(venueData.existingImages);
                venueData.images = existing; // Start with existing kept images
            } catch (e) { }
        } else if (venueData.existingImages) {
            venueData.images = venueData.existingImages;
        }

        if (req.files['thumbnail']) {
            venueData.thumbnail = req.files['thumbnail'][0].path;
        }

        if (req.files['images']) {
            const newImages = req.files['images'].map(file => file.path);
            venueData.images = (venueData.images || []).concat(newImages);
        }

        const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, venueData, { new: true });
        res.json(updatedVenue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete venue
router.delete('/:id', async (req, res) => {
    try {
        await Venue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venue deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
