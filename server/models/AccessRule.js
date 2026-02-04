const mongoose = require('mongoose');

const accessRuleSchema = new mongoose.Schema({
    feature: { type: String, required: true, unique: true },
    module: { type: String, default: 'General' }, // Sales, Logistics, Inventory, Finance
    availablePermissions: [{ type: String }], // e.g., ['Read', 'Write', 'Delete']
    admin: [{ type: String }],
    leadPlanner: [{ type: String }],
    assistant: [{ type: String }],
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccessRule', accessRuleSchema);
