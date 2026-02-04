const express = require('express');
const router = express.Router();
const Deal = require('../models/deal');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// Create a new deal
router.post('/', authMiddleware(), checkPermission('Pipeline', 'Write'), async (req, res) => {
    try {
        const newDeal = new Deal(req.body);
        const savedDeal = await newDeal.save();
        res.status(201).json(savedDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all deals
router.get('/', authMiddleware(), checkPermission('Pipeline', 'Read'), async (req, res) => {
    try {
        const deals = await Deal.find().sort({ createdAt: -1 });
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a deal (Stage drag-drop or details edit)
router.put('/:id', authMiddleware(), checkPermission('Pipeline', 'Write'), async (req, res) => {
    try {
        const updatedDeal = await Deal.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a deal
router.delete('/:id', authMiddleware(), checkPermission('Pipeline', 'Delete'), async (req, res) => {
    try {
        await Deal.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
