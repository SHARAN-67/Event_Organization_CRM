const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice');
const { authMiddleware, checkPermission } = require('../middleware/authMiddleware');

// GET all invoices
router.get('/', authMiddleware(), checkPermission('Invoices', 'Read'), async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single invoice
router.get('/:id', authMiddleware(), checkPermission('Invoices', 'Read'), async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE invoice
router.post('/', authMiddleware(), checkPermission('Invoices', 'Write'), async (req, res) => {
    try {
        const newInvoice = new Invoice(req.body);
        const savedInvoice = await newInvoice.save();
        res.status(201).json(savedInvoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE invoice
router.put('/:id', authMiddleware(), checkPermission('Invoices', 'Write'), async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedInvoice);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE invoice
router.delete('/:id', authMiddleware(), checkPermission('Invoices', 'Delete'), async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
