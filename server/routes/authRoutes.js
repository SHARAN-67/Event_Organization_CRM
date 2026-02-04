const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CompanyConfig = require('../models/CompanyConfig');
const AccessRule = require('../models/AccessRule');
const ActivityLog = require('../models/ActivityLog');
const { authMiddleware } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(403).json({
                error: `Account is locked due to multiple failed attempts. Try again in ${minutesLeft} minutes.`
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            // Increment failed attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
                user.failedLoginAttempts = 0; // Reset for after lock expires
            }
            await user.save();
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Success - Reset failed attempts
        user.failedLoginAttempts = 0;
        user.lockUntil = null;

        if (user.role !== 'Admin') {
            const config = await CompanyConfig.findOne();
            if (config && config.security && config.security.maintenanceMode) {
                return res.status(403).json({ error: 'System is currently in maintenance mode. Access restricted to Administrators.' });
            }
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Set online status
        user.isOnline = true;
        user.lastLoginAt = new Date();
        await user.save();

        // Log activity
        await ActivityLog.create({
            userId: user._id,
            userName: user.name,
            action: 'Login',
            details: `User logged in from ${req.ip}`
        });

        res.json({
            token,
            user: {
                id: user._id,
                agId: user.agId,
                name: user.name,
                role: user.role,
                email: user.email,
                mustChangePassword: user.mustChangePassword
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Logout
router.post('/logout', authMiddleware(), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            let durationStr = 'Unknown';
            if (user.lastLoginAt) {
                const durationMs = Date.now() - user.lastLoginAt;
                const hours = Math.floor(durationMs / 3600000);
                const minutes = Math.floor((durationMs % 3600000) / 60000);
                const seconds = Math.floor((durationMs % 60000) / 1000);

                const parts = [];
                if (hours > 0) parts.push(`${hours}h`);
                if (minutes > 0) parts.push(`${minutes}m`);
                if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
                durationStr = parts.join(' ');
            }

            user.isOnline = false;
            await user.save();

            // Log logout activity with duration
            await ActivityLog.create({
                userId: user._id,
                userName: user.name,
                action: 'Logout',
                details: `User logged out. Session duration: ${durationStr}`
            });
        }
        res.json({ message: 'User logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users (Admin/Lead Planner only)
router.get('/users', authMiddleware(['Admin', 'Lead Planner']), async (req, res) => {
    try {
        const users = await User.find().select('-password');

        // Ensure the current user requesting the list shows as online
        // (Just in case the DB state hasn't updated or they are actively polling)
        const updatedUsers = users.map(u => {
            if (u._id.toString() === req.user.id) {
                u.isOnline = true;
            }
            return u;
        });

        res.json(updatedUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (Team Management)
router.put('/users/:id', authMiddleware(['Admin']), async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // If password is provided and not empty, hash it
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update own profile
router.put('/profile', authMiddleware(), async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // Prevent users from changing their own role via profile route
        delete updateData.role;

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Admin-only: Create user (Team Management)
router.post('/users', authMiddleware(['Admin']), async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Change Password (authenticated)
router.post('/change-password', authMiddleware(), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Current password incorrect' });

        user.password = newPassword; // Will be hashed by pre-save
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Company Config
router.get('/config', async (req, res) => {
    try {
        let config = await CompanyConfig.findOne();
        if (!config) {
            config = new CompanyConfig();
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Company Config (Admin only)
router.put('/config', authMiddleware(['Admin']), async (req, res) => {
    try {
        const config = await CompanyConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set/Update Lock Password
router.put('/lock-password', authMiddleware(), async (req, res) => {
    const { lockPassword } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(lockPassword, 10);
        await User.findByIdAndUpdate(req.user.id, { lockPassword: hashedPassword });
        res.json({ message: 'Lock password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Lock Password
router.post('/verify-lock', authMiddleware(), async (req, res) => {
    const { lockPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user.lockPassword) return res.status(400).json({ error: 'Lock password not set' });

        const isMatch = await bcrypt.compare(lockPassword, user.lockPassword);
        if (!isMatch) return res.status(400).json({ error: 'Invalid lock password' });

        res.json({ message: 'Unlocked successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all access rules
router.get('/access-rules', authMiddleware(), async (req, res) => {
    try {
        let rules = await AccessRule.find();

        const initialRules = [
            // Sales Module
            { feature: 'Leads', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Contacts', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Documents', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Campaigns', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Pipeline', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            // Activities Module
            { feature: 'Tasks', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Meetings', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Email', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            // Inventory Module
            { feature: 'Products', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },

            { feature: 'Orders', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Invoices', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: [], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Vendors', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            // Management Module
            { feature: 'Account Settings', module: 'Management', admin: ['Read', 'Write'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write'] },
            // General/Utility
            { feature: 'Dashboard', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'Home', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'Reports', module: 'General', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read'], assistant: [], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Analytics', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'My Requests', module: 'General', admin: ['Read', 'Write'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write'] }
        ];

        // Backfill missing rules (robust seeding)
        let rulesUpdated = false;

        if (rules.length === 0) {
            await AccessRule.insertMany(initialRules);
            rulesUpdated = true;
        } else {
            // Check for each initial rule and add if missing
            // FIX: Only backfill CRITICAL system features to allow user to permanently delete optional modules
            const CRITICAL_FEATURES = [
                'Dashboard', 'Home', 'Account Settings',
                'Reports', 'Analytics', 'My Requests', 'Vendors'
            ];

            for (const initRule of initialRules) {
                if (CRITICAL_FEATURES.includes(initRule.feature)) {
                    const exists = rules.find(r => r.feature === initRule.feature);
                    if (!exists) {
                        await AccessRule.create(initRule);
                        rulesUpdated = true;
                    }
                }
            }
        }

        if (rulesUpdated) {
            rules = await AccessRule.find();
        }
        res.json(rules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an access rule (Admin only)
router.put('/access-rules/:id', authMiddleware(['Admin']), async (req, res) => {
    try {
        const payload = { ...req.body, updatedAt: Date.now(), updatedBy: req.user.name || 'Admin' };
        const rule = await AccessRule.findByIdAndUpdate(req.params.id, payload, { new: true });
        res.json(rule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore Security Defaults
router.post('/access-rules/reset', authMiddleware(['Admin']), async (req, res) => {
    try {
        await AccessRule.deleteMany({});
        const initialRules = [
            { feature: 'Leads', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Contacts', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Documents', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Campaigns', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Pipeline', module: 'Sales', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Tasks', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Meetings', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Email', module: 'Activities', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Products', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Logistics Hub', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Orders', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Invoices', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: [], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Vendors', module: 'Inventory', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read', 'Write'], assistant: ['Read'], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Account Settings', module: 'Management', admin: ['Read', 'Write'], leadPlanner: [], assistant: [], availablePermissions: ['Read', 'Write'] },
            { feature: 'Security Matrix', module: 'Management', admin: ['Read', 'Write'], leadPlanner: [], assistant: [], availablePermissions: ['Read', 'Write'] },
            { feature: 'Team', module: 'Management', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read'], assistant: [], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Audit Logs', module: 'Management', admin: ['Read'], leadPlanner: [], assistant: [], availablePermissions: ['Read'] },
            { feature: 'Settings', module: 'Management', admin: ['Read', 'Write'], leadPlanner: [], assistant: [], availablePermissions: ['Read', 'Write'] },
            { feature: 'Dashboard', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'Home', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'Reports', module: 'General', admin: ['Read', 'Write', 'Delete'], leadPlanner: ['Read'], assistant: [], availablePermissions: ['Read', 'Write', 'Delete'] },
            { feature: 'Analytics', module: 'General', admin: ['Read'], leadPlanner: ['Read'], assistant: ['Read'], availablePermissions: ['Read'] },
            { feature: 'My Requests', module: 'General', admin: ['Read', 'Write'], leadPlanner: ['Read', 'Write'], assistant: ['Read', 'Write'], availablePermissions: ['Read', 'Write'] }
        ];
        await AccessRule.insertMany(initialRules);
        res.json({ message: "Security templates restored to factory defaults." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new access rule (Admin only)
router.post('/access-rules', authMiddleware(['Admin']), async (req, res) => {
    try {
        const { feature, module, admin, leadPlanner, assistant, availablePermissions } = req.body;

        if (!feature || !module) {
            return res.status(400).json({ error: 'Feature and module are required.' });
        }

        const newRule = new AccessRule({
            feature,
            module,
            admin: admin || [],
            leadPlanner: leadPlanner || [],
            assistant: assistant || [],
            availablePermissions: availablePermissions || ['Read']
        });
        await newRule.save();
        res.status(201).json(newRule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an access rule (Admin only)
router.delete('/access-rules/:id', authMiddleware(['Admin']), async (req, res) => {
    try {
        await AccessRule.findByIdAndDelete(req.params.id);
        res.json({ message: "Access protocol decommissioned." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Activity Logs for a user (Admin only)
router.get('/logs/:userId', authMiddleware(['Admin']), async (req, res) => {
    try {
        const logs = await ActivityLog.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
