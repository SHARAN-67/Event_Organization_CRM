const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { authMiddleware } = require('../middleware/authMiddleware');

// GET all campaigns
router.get('/', authMiddleware(), async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one campaign
router.get('/:id', authMiddleware(), async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create campaign
router.post('/', authMiddleware(), async (req, res) => {
    const campaign = new Campaign({
        name: req.body.name,
        status: req.body.status,
        reach: req.body.reach,
        roi: req.body.roi,
        budget: req.body.budget,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        description: req.body.description,
    });

    try {
        const newCampaign = await campaign.save();
        res.status(201).json(newCampaign);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update campaign
router.put('/:id', authMiddleware(), async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        if (req.body.name != null) campaign.name = req.body.name;
        if (req.body.status != null) campaign.status = req.body.status;
        if (req.body.reach != null) campaign.reach = req.body.reach;
        if (req.body.roi != null) campaign.roi = req.body.roi;
        if (req.body.budget != null) campaign.budget = req.body.budget;
        if (req.body.startDate != null) campaign.startDate = req.body.startDate;
        if (req.body.endDate != null) campaign.endDate = req.body.endDate;
        if (req.body.description != null) campaign.description = req.body.description;

        const updatedCampaign = await campaign.save();
        res.json(updatedCampaign);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE campaign
router.delete('/:id', authMiddleware(), async (req, res) => {
    try {
        const displayRes = await Campaign.findByIdAndDelete(req.params.id);
        if (!displayRes) return res.status(404).json({ message: 'Campaign not found' });
        res.json({ message: 'Campaign deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
