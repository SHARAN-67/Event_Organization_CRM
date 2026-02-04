const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAccess } = require('../middleware/rbacMiddleware');
const { PERMISSIONS } = require('../security/rbacPolicy');

// GET all products
router.get('/', authMiddleware(), requireAccess(PERMISSIONS.PRODUCTS.VIEW, 'products'), async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single product
router.get('/:id', authMiddleware(), requireAccess(PERMISSIONS.PRODUCTS.VIEW, 'products'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE product
router.post('/', authMiddleware(), requireAccess(PERMISSIONS.PRODUCTS.MANAGE, 'products'), async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();

        if (req.user) {
            await ActivityLog.create({
                userId: req.user.id,
                action: 'Inventory Add',
                details: `Added new resource: ${savedProduct.productName}`
            });
        }

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE product
router.put('/:id', authMiddleware(), requireAccess(PERMISSIONS.PRODUCTS.MANAGE, 'products'), async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (req.user) {
            await ActivityLog.create({
                userId: req.user.id,
                action: 'Inventory Update',
                details: `Modified resource: ${updatedProduct.productName}`
            });
        }

        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE product
router.delete('/:id', authMiddleware(), requireAccess(PERMISSIONS.PRODUCTS.ROOT, 'products'), async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
