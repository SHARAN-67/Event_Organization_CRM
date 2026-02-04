const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    agId: { type: String, unique: true, sparse: true }, // Format: AG-XXXX
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jobTitle: { type: String, default: 'Lead Planner' },
    phone_number: { type: String },
    role: {
        type: String,
        default: 'Assistant'
    },
    mustChangePassword: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lockPassword: { type: String },
    avatar: { type: String },
    isOnline: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
