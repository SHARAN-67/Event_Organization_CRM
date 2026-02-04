const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// GET all events
router.get('/', authMiddleware(), checkPermission('Meetings', 'Read'), async (req, res) => {
    try {
        const events = await Event.find({ userId: req.user.id }).sort({ startDate: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET events by date range
router.get('/range', authMiddleware(), checkPermission('Meetings', 'Read'), async (req, res) => {
    try {
        const { start, end } = req.query;
        const events = await Event.find({
            userId: req.user.id,
            startDate: { $gte: new Date(start) },
            endDate: { $lte: new Date(end) }
        }).sort({ startDate: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single event
router.get('/:id', authMiddleware(), checkPermission('Meetings', 'Read'), async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new event
router.post('/', authMiddleware(), checkPermission('Meetings', 'Write'), async (req, res) => {
    const event = new Event({
        userId: req.user.id,
        eventName: req.body.eventName,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        venue: req.body.venue,
        status: req.body.status,
        eventType: req.body.eventType,
        budget: req.body.budget,
        amountSpent: req.body.amountSpent
    });

    try {
        const newEvent = await event.save();

        // Log activity if user is authenticated
        if (req.user) {
            await ActivityLog.create({
                userId: req.user.id,
                action: 'Create Event/Lead',
                details: `Created new mission protocol: ${newEvent.eventName}`
            });
        }

        res.status(201).json(newEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update event
router.put('/:id', authMiddleware(), checkPermission('Meetings', 'Write'), async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        Object.keys(req.body).forEach(key => {
            event[key] = req.body[key];
        });

        const updatedEvent = await event.save();

        // Log significant changes
        if (req.user) {
            await ActivityLog.create({
                userId: req.user.id,
                action: 'Update Event',
                details: `Updated parameters for: ${updatedEvent.eventName}`
            });
        }

        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE event
router.delete('/:id', authMiddleware(), checkPermission('Meetings', 'Delete'), async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, userId: req.user.id });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
