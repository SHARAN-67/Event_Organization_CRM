/**
 * @file rbacPolicy.js
 * @description Centralized Role-Based Access Control Policy Definition
 * Defines granular permissions and data masking rules for the entire application.
 */

const ROLES = {
    ADMIN: 'Admin',
    LEAD_PLANNER: 'Lead Planner',
    PLANNER: 'Planner',
    ASSISTANT: 'Assistant'
};

const PERMISSIONS = {
    LEADS: {
        VIEW: 'leads:view',
        MANAGE: 'leads:manage',
        FULFILL: 'leads:fulfill',
        ROOT: 'leads:root'
    },
    CONTACTS: {
        VIEW: 'contacts:view',
        MANAGE: 'contacts:manage',
        ROOT: 'contacts:root' // Delete
    },
    TASKS: {
        VIEW: 'tasks:view',
        MANAGE: 'tasks:manage',
        ROOT: 'tasks:root' // Delete others' tasks
    },
    PRODUCTS: {
        VIEW: 'products:view',
        MANAGE: 'products:manage',
        ROOT: 'products:root'
    }
};

/**
 * RBAC Policy Definition
 * Structure:
 * Role -> { can: [Permissions], masking: { Resource: [FieldsToMask] } }
 */
const POLICY = {
    [ROLES.ADMIN]: {
        can: [
            PERMISSIONS.LEADS.VIEW, PERMISSIONS.LEADS.MANAGE, PERMISSIONS.LEADS.ROOT, PERMISSIONS.LEADS.FULFILL,
            PERMISSIONS.CONTACTS.VIEW, PERMISSIONS.CONTACTS.MANAGE, PERMISSIONS.CONTACTS.ROOT,
            PERMISSIONS.TASKS.VIEW, PERMISSIONS.TASKS.MANAGE, PERMISSIONS.TASKS.ROOT,
            PERMISSIONS.PRODUCTS.VIEW, PERMISSIONS.PRODUCTS.MANAGE, PERMISSIONS.PRODUCTS.ROOT
        ],
        masking: {}
    },
    [ROLES.LEAD_PLANNER]: {
        can: [
            PERMISSIONS.LEADS.VIEW, PERMISSIONS.LEADS.MANAGE, PERMISSIONS.LEADS.FULFILL,
            PERMISSIONS.CONTACTS.VIEW, PERMISSIONS.CONTACTS.MANAGE,
            PERMISSIONS.TASKS.VIEW, PERMISSIONS.TASKS.MANAGE,
            PERMISSIONS.PRODUCTS.VIEW,
            PERMISSIONS.PRODUCTS.MANAGE
        ],
        masking: {}
    },
    [ROLES.PLANNER]: {
        can: [
            PERMISSIONS.LEADS.VIEW, PERMISSIONS.LEADS.MANAGE, PERMISSIONS.LEADS.FULFILL,
            PERMISSIONS.CONTACTS.VIEW, PERMISSIONS.CONTACTS.MANAGE,
            PERMISSIONS.TASKS.VIEW, PERMISSIONS.TASKS.MANAGE,
            PERMISSIONS.PRODUCTS.VIEW,
            PERMISSIONS.PRODUCTS.MANAGE
        ],
        masking: {}
    },
    [ROLES.ASSISTANT]: {
        can: [
            PERMISSIONS.LEADS.VIEW,
            PERMISSIONS.LEADS.FULFILL,
            PERMISSIONS.CONTACTS.VIEW,
            PERMISSIONS.TASKS.VIEW,
            PERMISSIONS.TASKS.MANAGE,
            PERMISSIONS.PRODUCTS.VIEW
        ],
        masking: {
            leads: ['value'],
            contacts: ['email', 'phone_number'],
            // Products usually public price internally, but maybe mask cost price if it exists
        }
    }
};

module.exports = {
    ROLES,
    PERMISSIONS,
    POLICY
};
