const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// Create a new vendor
router.post('/', authMiddleware(), checkPermission('Vendors', 'Write'), async (req, res) => {
    try {
        const newVendor = new Vendor(req.body);
        const savedVendor = await newVendor.save();
        res.status(201).json(savedVendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all vendors
router.get('/', authMiddleware(), checkPermission('Vendors', 'Read'), async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ createdAt: -1 });
        res.status(200).json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a vendor
router.put('/:id', authMiddleware(), checkPermission('Vendors', 'Write'), async (req, res) => {
    try {
        const updatedVendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a vendor
router.delete('/:id', authMiddleware(), checkPermission('Vendors', 'Delete'), async (req, res) => {
    try {
        await Vendor.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
