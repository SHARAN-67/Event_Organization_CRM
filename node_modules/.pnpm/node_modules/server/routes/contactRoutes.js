const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAccess } = require('../middleware/rbacMiddleware');
const { PERMISSIONS } = require('../security/rbacPolicy');

// GET all contacts
router.get('/', authMiddleware(), requireAccess(PERMISSIONS.CONTACTS.VIEW, 'contacts'), async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        const formattedContacts = contacts.map(contact => ({
            ...contact.toObject(),
            id: contact._id
        }));
        res.json(formattedContacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single contact
router.get('/:id', authMiddleware(), requireAccess(PERMISSIONS.CONTACTS.VIEW, 'contacts'), async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json({ ...contact.toObject(), id: contact._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create new contact
router.post('/', authMiddleware(), requireAccess(PERMISSIONS.CONTACTS.MANAGE, 'contacts'), async (req, res) => {
    const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        company: req.body.company,
        role: req.body.role,
        type: req.body.type,
        checkInStatus: req.body.checkInStatus || 'no-ticket',
        events: req.body.events || []
    });

    try {
        const newContact = await contact.save();
        res.status(201).json({ ...newContact.toObject(), id: newContact._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update contact
router.put('/:id', authMiddleware(), requireAccess(PERMISSIONS.CONTACTS.MANAGE, 'contacts'), async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        const fields = ['name', 'email', 'phone_number', 'company', 'role', 'type', 'checkInStatus', 'events'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                contact[field] = req.body[field];
            }
        });

        const updatedContact = await contact.save();
        res.json({ ...updatedContact.toObject(), id: updatedContact._id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE contact
router.delete('/:id', authMiddleware(), requireAccess(PERMISSIONS.CONTACTS.ROOT, 'contacts'), async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
