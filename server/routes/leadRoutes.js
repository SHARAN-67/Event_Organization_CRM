const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireAccess } = require('../middleware/rbacMiddleware');
const { PERMISSIONS } = require('../security/rbacPolicy');

// GET all leads
// Requires VIEW permission. Auto-masks data for Assistants.
router.get('/', authMiddleware(), requireAccess(PERMISSIONS.LEADS.VIEW, 'leads'), async (req, res) => {
    try {
        const query = {};
        if (req.query.assignedTo) {
            try {
                query.assignedTo = new mongoose.Types.ObjectId(req.query.assignedTo);
            } catch (err) {
                // If invalid ID, don't return anything or handle as error
                return res.json([]);
            }
        }

        const leads = await Lead.find(query).sort({ createdAt: -1 }).populate('assignedTo', 'name email role');
        // Map _id to id for frontend compatibility
        // Note: Formatting is done here, masking happens in res.json() override
        const formattedLeads = leads.map(lead => ({
            ...lead.toObject(),
            id: lead._id
        }));
        res.json(formattedLeads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single lead
router.get('/:id', authMiddleware(), requireAccess(PERMISSIONS.LEADS.VIEW, 'leads'), async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ message: 'Lead not found' });
        res.json({ ...lead.toObject(), id: lead._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE lead
// Requires MANAGE permission.
router.post('/', authMiddleware(), requireAccess(PERMISSIONS.LEADS.MANAGE, 'leads'), async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        const savedLead = await newLead.save();
        res.status(201).json({ ...savedLead.toObject(), id: savedLead._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUBLIC Lead Capture (No Auth Required)
// Used for Website forms or Ads links
router.post('/public', async (req, res) => {
    try {
        const { name, company, email, phone_number, details, source } = req.body;

        // Validation
        if (!name || !email || !company) {
            return res.status(400).json({ error: 'Name, Email, and Company are required fields.' });
        }

        const newLead = new Lead({
            name,
            company,
            email,
            phone_number,
            notes: details || '',
            source: source || 'Public Web Form',
            status: 'New'
        });

        const savedLead = await newLead.save();
        res.status(201).json({
            message: 'Thank you! Your request has been submitted successfully.',
            leadId: savedLead._id
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE lead
// Requires MANAGE permission.
router.put('/:id', authMiddleware(), requireAccess(PERMISSIONS.LEADS.MANAGE, 'leads'), async (req, res) => {
    try {
        const updatedLead = await Lead.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        res.json({ ...updatedLead.toObject(), id: updatedLead._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE lead
// Requires ROOT permission.
router.delete('/:id', authMiddleware(), requireAccess(PERMISSIONS.LEADS.ROOT, 'leads'), async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// WORKFLOW status update
// Requires FULFILL or MANAGE permission manually checked
router.patch('/:id/status', authMiddleware(), async (req, res) => {
    try {
        const { status } = req.body;
        const lead = await Lead.findById(req.params.id);

        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        const userRole = req.user.role;
        // Check permissions manually since requireAccess is all-or-nothing for a massive resource,
        // and we have complex logic here.
        // Or we could have used requireAccess(PERMISSIONS.LEADS.FULFILL, 'leads') if we didn't have MANAGE users too.

        // Helper to check policy content
        const { POLICY, PERMISSIONS } = require('../security/rbacPolicy');
        const userPolicy = POLICY[userRole];

        const canManage = userPolicy && userPolicy.can.includes(PERMISSIONS.LEADS.MANAGE);
        const canFulfill = userPolicy && userPolicy.can.includes(PERMISSIONS.LEADS.FULFILL);

        if (!canManage && !canFulfill) {
            return res.status(403).json({ error: 'Access Denied: Insufficient Privileges' });
        }

        // Logic:
        // MANAGE (Planner/Admin) can do: ANY -> Accepted, ANY -> Denied
        // FULFILL (Assistance) can do: Accepted -> Processing, Processing -> Completed

        // Simplified Logic: 
        // IF MANAGE, allowed everything (or restricted to approval?) -> Prompt says Planner/Admin does Accept/Deny
        // IF FULFILL && !MANAGE (Assistance), only allow Accepted->Processing->Completed

        if (!canManage && canFulfill) {
            // Assistant (Fulfill) Role Limits
            const allowedTransitions = {
                'Accepted': 'Processing',
                'Processing': 'Completed'
            };

            if (allowedTransitions[lead.status] !== status) {
                return res.status(400).json({
                    error: `Invalid status transition for your role. You can only move from ${lead.status} to ${allowedTransitions[lead.status] || 'nothing'}.`
                });
            }
        } else if (canManage) {
            // Planner/Admin (Manage) can Accept or Deny
            const allowedActions = ['Accepted', 'Denied', 'New'];
            if (!allowedActions.includes(status) && !canFulfill) {
                return res.status(400).json({ error: 'Invalid management action. Use Accepted or Denied.' });
            }
        }

        // Apply Update
        lead.status = status;
        if (req.body.assignedTo) {
            try {
                lead.assignedTo = new mongoose.Types.ObjectId(req.body.assignedTo);
            } catch (err) {
                return res.status(400).json({ error: 'Invalid assignedTo User ID format' });
            }
        }
        lead.updatedAt = Date.now();
        await lead.save();

        const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email role');
        res.json({ ...populatedLead.toObject(), id: lead._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
