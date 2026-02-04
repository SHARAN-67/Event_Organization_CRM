const jwt = require('jsonwebtoken');
const AccessRule = require('../models/AccessRule');

const authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            req.user = verified;

            if (roles.length) {
                const userRoleLower = verified.role?.toLowerCase();
                const hasRole = roles.some(r => r.toLowerCase() === userRoleLower);
                if (!hasRole) {
                    return res.status(403).json({ error: 'Access Denied: Insufficient Permissions' });
                }
            }
            next();
        } catch (err) {
            res.status(400).json({ error: 'Invalid Token' });
        }
    };
};

/**
 * Dynamic permission checker
 * @param {string} feature - e.g., 'Lead Management'
 * @param {string} permission - e.g., 'Write'
 */
const checkPermission = (feature, permission) => {
    return async (req, res, next) => {
        try {
            // First ensure user is authenticated
            if (!req.user) return res.status(401).json({ error: 'Unauthorized: No active session' });

            const rule = await AccessRule.findOne({ feature });
            if (!rule) return next(); // If no rule exists, default to allowing (or change to deny if preferred)

            // Map JWT role to AccessRule field
            const roleFieldMap = {
                'Admin': 'admin',
                'Lead Planner': 'leadPlanner',
                'Assistant': 'assistant'
            };

            const field = roleFieldMap[req.user.role];
            if (!field || !rule[field].includes(permission)) {
                return res.status(403).json({
                    error: `Security Protocol Breach: Role '${req.user.role}' lacks '${permission}' authorization for '${feature}'.`
                });
            }

            next();
        } catch (err) {
            res.status(500).json({ error: 'Middleware Error: Access Verification Failed' });
        }
    };
};

module.exports = { authMiddleware, checkPermission };
