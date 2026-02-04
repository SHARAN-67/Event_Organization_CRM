/**
 * @file rbacMiddleware.js
 * @description Security Middleware for enforcing RBAC and Data Masking.
 * Implements the "Access Control List" (ACL) pattern.
 */

const { POLICY, ROLES } = require('../security/rbacPolicy');

/**
 * Helper to mask sensitive fields in an object or array of objects.
 * @param {Object|Array} data - The data to mask.
 * @param {Array} fieldsToMask - List of keys to redact.
 * @returns {Object|Array} - The masked data.
 */
const maskData = (data, fieldsToMask, currentUserId) => {
    if (!data || !fieldsToMask || fieldsToMask.length === 0) return data;

    if (Array.isArray(data)) {
        return data.map(item => maskData(item, fieldsToMask, currentUserId));
    }

    if (typeof data === 'object') {
        // Bypass masking if the user is assigned to this specific resource
        const leadAssignedTo = data.assignedTo?._id?.toString() || data.assignedTo?.toString();
        if (leadAssignedTo && leadAssignedTo === currentUserId?.toString()) {
            return data;
        }

        const maskedItem = { ...data };
        // Check if it's a Mongoose document and convert to Object if necessary
        const sourceData = data.toObject ? data.toObject() : data;

        // Re-assign to ensure we're working with a plain object
        Object.assign(maskedItem, sourceData);

        fieldsToMask.forEach(field => {
            if (maskedItem[field]) {
                // partial redaction could be complex, simple redaction for now
                // Identify the type to decide how to mask
                if (field.includes('email')) {
                    maskedItem[field] = '*****@****.com';
                } else if (field.includes('phone')) {
                    maskedItem[field] = '***-***-****';
                } else if (field.includes('value')) {
                    maskedItem[field] = '****';
                } else {
                    maskedItem[field] = '[REDACTED]';
                }
            }
        });
        return maskedItem;
    }

    return data;
};

/**
 * RBAC Middleware Factory
 * @param {string} requiredPermission - The permission required (e.g., 'leads:view')
 * @param {string} resourceName - The resource key for masking (e.g., 'leads')
 */
const requireAccess = (requiredPermission, resourceName) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({
                    error: 'Unauthenticated',
                    code: 'AUTH_REQUIRED'
                });
            }

            const userPolicy = POLICY[userRole];

            // 1. Check Role Existence
            if (!userPolicy) {
                return res.status(403).json({
                    error: 'Access Denied: Invalid Role',
                    code: 'ROLE_INVALID'
                });
            }

            // 2. Check Permission Logic
            // Admin gets bypass usually, but we'll stick to strict policy checking
            // We verify if the user's role has the specific granular permission
            const hasPermission = userPolicy.can.includes(requiredPermission);

            if (!hasPermission) {
                // Log the security event (IDOR prevention auditing would go here)
                console.warn(`SECURITY: Unauthorized access attempt by ${req.user.email} (Role: ${userRole}) for ${requiredPermission}`);
                return res.status(403).json({
                    error: 'Access Denied: Insufficient Privileges',
                    code: 'PERM_DENIED'
                });
            }

            // 3. Attach Data Masking to Response
            // We override res.json to automatically apply masking based on the resource
            const originalJson = res.json;
            res.json = function (data) {
                const fieldsToMask = userPolicy.masking[resourceName] || [];

                if (fieldsToMask.length > 0) {
                    const masked = maskData(data, fieldsToMask, req.user.id);
                    return originalJson.call(this, masked);
                }

                return originalJson.call(this, data);
            };

            next();

        } catch (error) {
            console.error('RBAC Middleware Error:', error);
            return res.status(500).json({ error: 'Internal Security Error' });
        }
    };
};

module.exports = { requireAccess };
