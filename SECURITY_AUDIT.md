# Security Audit: Role-Based Access Control (RBAC) & IDOR Prevention

## Executive Summary
This document outlines the security architecture implemented for the Leads module within the System Core v3 ecosystem. The system utilizes a granular Permission Schema, a centralized Policy Engine, and robust Backend Middleware to ensure strict access control and data integrity.

## 1. Architecture Overview
The security model is built on three layers:
1.  **Frontend Policy Engine**: Removes restricted UI elements from the DOM, preventing accidental interaction.
2.  **Backend JSON Policy**: Defines the "Single Source of Truth" for all roles and permissions.
3.  **Access Control Middleware**: Enforces policy on every API request.

## 2. Granular Permission Schema
We moved away from broad "Read/Write" roles to specific logical permissions:
- `leads:view`: Grant read-only access.
- `leads:manage`: Grant creation and modification rights.
- `leads:root`: Grant destructive rights (Delete, Export).

**Bitmask/Policy Map:**
- **Admin**: `[*]` (All permissions)
- **Lead Planner**: `[leads:view, leads:manage]`
- **Assistant**: `[leads:view]` + **Data Masking**

## 3. IDOR Prevention Strategy
**Scenario**: A "View-only" user (e.g., Assistant) attempts an Insecure Direct Object Reference (IDOR) attack.
- **Attack Vector**: The user inspects the network traffic, finds a Lead ID (e.g., `65b2...`), and manually sends a `DELETE /api/leads/65b2...` request using Postman or CURL.

**Defense Mechanism**:
1.  **Middleware Interception**: The request first hits `requireAccess(PERMISSIONS.LEADS.ROOT, 'leads')`.
2.  **Policy Lookup**: The middleware retrieves the user's role (`Assistant`) from the validated JWT.
3.  **Permission Validation**: It checks the `Assistant` policy: `{ can: ['leads:view'] }`.
4.  **Rejection**: The check verifies if `leads:root` is present. It is NOT.
5.  **Outcome**: The server responds with `403 Forbidden` immediately. The database query `Lead.findByIdAndDelete` is **never executed**.

**Code Evidence (`server/middleware/rbacMiddleware.js`)**:
```javascript
const hasPermission = userPolicy.can.includes(requiredPermission);
if (!hasPermission) {
    console.warn(`SECURITY: Unauthorized access attempt...`);
    return res.status(403).json({ error: 'Access Denied' });
}
```

## 4. Data Masking (Deep Security)
To prevent creating a "shadow API" where all data is exposed even to view-only users, we implemented response interception.
- **Mechanism**: The middleware wraps the `res.json` method.
- **Logic**: If the user is an `Assistant`, the middleware iterates through the response object and redacts restricted fields (`email`, `phone`, `value`) *before* the data leaves the server.
- **Result**: Even if a junior employee scrapes the API, they only get `*****@****.com`.

## 5. Conclusion
The implementation eliminates IDOR vulnerabilities by decoupling the *ability to reference an ID* from the *authority to act on it*. Security is enforced at the API boundary, treating every request as potentially untrusted, regardless of the frontend state.
