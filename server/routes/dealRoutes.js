const express = require('express');
const router = express.Router();
const Deal = require('../models/deal');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// Create a new deal
router.post('/', authMiddleware(), checkPermission('Pipeline', 'Write'), async (req, res) => {
    try {
        const newDeal = new Deal({
            ...req.body,
            userId: req.user.id
        });
        const savedDeal = await newDeal.save();
        res.status(201).json(savedDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all deals (Shared Pipeline)
router.get('/', authMiddleware(), checkPermission('Pipeline', 'Read'), async (req, res) => {
    try {
        // Return ALL deals for authorized users (Shared View)
        const deals = await Deal.find({}).sort({ createdAt: -1 });
        res.status(200).json(deals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a deal (change stage, drag & drop, etc)
router.put('/:id', authMiddleware(), checkPermission('Pipeline', 'Write'), async (req, res) => {
    try {
        // Allow updating any deal if user has Write permission
        const deal = await Deal.findOne({ _id: req.params.id });
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }

        const updates = req.body;

        // Change Tracking Logic: If deal is Live, track changes
        // Assuming 'Live' is the critical stage name
        if (deal.stage === 'Live' || updates.stage === 'Live') {
            const changes = [];
            const trackedFields = ['title', 'value', 'stage', 'date', 'attendees', 'venue'];

            trackedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    let oldVal = deal[field];
                    let newVal = updates[field];

                    if (oldVal instanceof Date) oldVal = oldVal.toISOString();

                    if (oldVal != newVal) {
                        changes.push({
                            field: field,
                            oldValue: deal[field],
                            newValue: updates[field]
                        });
                    }
                }
            });

            if (changes.length > 0) {
                deal.changeLog.push({
                    modifiedBy: req.user.id,
                    changes: changes
                });
            }
        }

        Object.keys(req.body).forEach(key => {
            deal[key] = req.body[key];
        });

        const updatedDeal = await deal.save();
        res.json(updatedDeal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a deal
router.delete('/:id', authMiddleware(), checkPermission('Pipeline', 'Delete'), async (req, res) => {
    try {
        // Allow deleting any deal if user has Delete permission
        const deal = await Deal.findOneAndDelete({ _id: req.params.id });
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        res.status(200).json({ message: 'Deal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
