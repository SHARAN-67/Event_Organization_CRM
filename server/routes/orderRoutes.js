const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// Create a new order
router.post('/', authMiddleware(), checkPermission('Orders', 'Write'), async (req, res) => {
    try {
        const { customerName, eventType, eventDate, amount, status } = req.body;
        const newOrder = new Order({ customerName, eventType, eventDate, amount, status });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all orders
router.get('/', authMiddleware(), checkPermission('Orders', 'Read'), async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an order
router.put('/:id', authMiddleware(), checkPermission('Orders', 'Write'), async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an order
router.delete('/:id', authMiddleware(), checkPermission('Orders', 'Delete'), async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
