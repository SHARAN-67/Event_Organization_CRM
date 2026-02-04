const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * Generate a unique AG-ID (Format: AG-XXXX)
 */
const generateAgId = async () => {
    let agId;
    let exists = true;
    while (exists) {
        agId = 'AG-' + crypto.randomBytes(2).toString('hex').toUpperCase();
        exists = await User.findOne({ agId });
    }
    return agId;
};

/**
 * Generate a random strong password
 */
const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(crypto.randomInt(chars.length));
    }
    return password;
};

// Admin only: Get all users for the vault
router.get('/users', authMiddleware(['Admin']), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Provision new user
router.post('/users/create', authMiddleware(['Admin']), async (req, res) => {
    const { name, email, role, jobTitle } = req.body;
    try {
        // Check if email exists
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ error: 'Email already registered' });

        const agId = await generateAgId();
        const rawPassword = generateStrongPassword();

        const newUser = new User({
            agId,
            name,
            email,
            password: rawPassword, // Will be hashed by pre-save hook
            role: role || 'Assistant',
            jobTitle: jobTitle || 'Personnel',
            mustChangePassword: true
        });

        await newUser.save();

        res.json({
            message: 'User provisioned successfully',
            user: {
                id: newUser._id,
                agId: newUser.agId,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            temporaryPassword: rawPassword // One-time view
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin only: Reset user password
router.post('/users/:id/reset-password', authMiddleware(['Admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const newPassword = generateStrongPassword();
        user.password = newPassword;
        user.mustChangePassword = true;
        await user.save();

        res.json({
            message: 'Password reset successful',
            temporaryPassword: newPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
