import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, XCircle, AlertTriangle, Lock, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessRules } from '../../hooks/useAccessRules';

const AccessControl = ({ token }) => {
    const {
        rules, loading, error, lastModified,
        fetchRules, saveAllRules, addRule, deleteRule,
        togglePermission
    } = useAccessRules();

    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState('admin');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [newRule, setNewRule] = useState({
        feature: '',
        module: 'Sales',
        availablePermissions: ['Read', 'Write', 'Delete']
    });
    const [addError, setAddError] = useState('');

    const { hasPermission } = useAuth();
    const canWrite = hasPermission('Security Matrix', 'Write');

    useEffect(() => {
        fetchRules();
    }, [fetchRules]);

    const handleToggle = (ruleId, permission) => {
        if (!canWrite) return;
        togglePermission(ruleId, selectedRole, permission);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await saveAllRules(rules);
        if (result.success) {
            alert("Security matrix saved successfully.");
        } else {
            alert(result.error || "Failed to save.");
        }
        setSaving(false);
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        setAddError('');

        if (!newRule.feature.trim()) {
            setAddError("Feature name is required.");
            return;
        }

        if (newRule.availablePermissions.length === 0) {
            setAddError("Select at least one permission.");
            return;
        }

        const ruleData = {
            feature: newRule.feature.trim(),
            module: newRule.module,
            availablePermissions: newRule.availablePermissions,
            admin: newRule.availablePermissions.includes('Read') ? ['Read'] : [],
            leadPlanner: [],
            assistant: []
        };

        const result = await addRule(ruleData);

        if (result.success) {
            setShowAddModal(false);
            setNewRule({ feature: '', module: 'Sales', availablePermissions: ['Read', 'Write', 'Delete'] });
            setAddError('');
            await fetchRules();
        } else {
            setAddError(result.error || "Failed to create module. Please try again.");
        }
    };

    const handleDeleteRule = async () => {
        if (!showDeleteModal) return;
        const result = await deleteRule(showDeleteModal._id);
        if (result.success) {
            setShowDeleteModal(null);
        } else {
            alert(result.error || "Failed to delete.");
        }
    };

    if (loading && rules.length === 0) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading permissions...</div>;
    }

    if (error && rules.length === 0) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;
    }

    // Group rules by module
    const modules = ['Sales', 'Activities', 'Inventory', 'Management', 'General'];
    const groupedRules = {};
    modules.forEach(mod => {
        groupedRules[mod] = rules.filter(r => r.module === mod);
    });

    // Build flat list for display
    const flatRows = [];
    modules.forEach(moduleName => {
        const moduleRules = groupedRules[moduleName] || [];
        moduleRules.forEach((rule, idx) => {
            flatRows.push({
                rule,
                moduleName,
                isFirstInModule: idx === 0,
                moduleRowCount: moduleRules.length
            });
        });
    });

    return (
        <div style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Access Rights</h1>
                    <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                        Manage permissions for {selectedRole === 'admin' ? 'Global Admin' : selectedRole === 'leadPlanner' ? 'Lead Planner' : 'Assistant'}
                    </p>
                </div>
                {canWrite && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowAddModal(true)} style={SecondaryBtnStyle}>
                            <Plus size={16} /> Add Module
                        </button>
                        <button onClick={handleSave} disabled={saving} style={PrimaryBtnStyle}>
                            <ShieldCheck size={16} /> {saving ? 'Saving...' : 'Save Matrix'}
                        </button>
                    </div>
                )}
                {!canWrite && (
                    <div style={{ padding: '8px 16px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} /> Read-Only Mode
                    </div>
                )}
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[
                    { id: 'admin', label: 'Global Admin' },
                    { id: 'leadPlanner', label: 'Lead Planner' },
                    { id: 'assistant', label: 'Assistant' }
                ].map(role => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: selectedRole === role.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            backgroundColor: selectedRole === role.id ? '#eff6ff' : 'white',
                            color: selectedRole === role.id ? '#3b82f6' : '#64748b',
                            fontWeight: selectedRole === role.id ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Permissions Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 100px 100px 100px 60px', padding: '14px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={TableHeaderStyle}>Module Group</div>
                    <div style={TableHeaderStyle}>Sub-Module</div>
                    <div style={{ ...TableHeaderStyle, textAlign: 'center' }}>View (Read)</div>
                    <div style={{ ...TableHeaderStyle, textAlign: 'center' }}>Create/Edit</div>
                    <div style={{ ...TableHeaderStyle, textAlign: 'center' }}>Delete</div>
                    {canWrite && <div style={{ ...TableHeaderStyle, textAlign: 'center' }}>Actions</div>}
                </div>

                {/* Table Body */}
                {flatRows.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No access rules found. Click "Add Module" to create one.
                    </div>
                ) : (
                    flatRows.map(({ rule, moduleName, isFirstInModule }) => (
                        <div
                            key={rule._id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: canWrite ? '130px 1fr 100px 100px 100px 60px' : '130px 1fr 100px 100px 100px',
                                padding: '14px 20px',
                                borderBottom: '1px solid #f1f5f9',
                                alignItems: 'center'
                            }}
                        >
                            {/* Module Group */}
                            <div style={{
                                fontWeight: isFirstInModule ? '700' : '400',
                                color: isFirstInModule ? '#1e293b' : 'transparent',
                                fontSize: '14px'
                            }}>
                                {isFirstInModule ? moduleName : ''}
                            </div>

                            {/* Sub-Module */}
                            <div style={{ color: '#475569', fontSize: '14px' }}>
                                {rule.feature}
                            </div>

                            {/* View (Read) */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {rule.availablePermissions?.includes('Read') ? (
                                    <Checkbox
                                        checked={(rule[selectedRole] || []).includes('Read')}
                                        onChange={() => handleToggle(rule._id, 'Read')}
                                        disabled={!canWrite}
                                    />
                                ) : (
                                    <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                            </div>

                            {/* Create/Edit */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {rule.availablePermissions?.includes('Write') ? (
                                    <Checkbox
                                        checked={(rule[selectedRole] || []).includes('Write')}
                                        onChange={() => handleToggle(rule._id, 'Write')}
                                        disabled={!canWrite}
                                    />
                                ) : (
                                    <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                            </div>

                            {/* Delete */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                {rule.availablePermissions?.includes('Delete') ? (
                                    <Checkbox
                                        checked={(rule[selectedRole] || []).includes('Delete')}
                                        onChange={() => handleToggle(rule._id, 'Delete')}
                                        disabled={!canWrite}
                                    />
                                ) : (
                                    <span style={{ color: '#cbd5e1' }}>—</span>
                                )}
                            </div>

                            {/* Actions - Delete Button */}
                            {canWrite && (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => setShowDeleteModal(rule)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: '#fef2f2',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Remove module"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Last Modified */}
            <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>
                    Last Modified: <strong style={{ color: '#1e293b' }}>{lastModified.by || 'System'}</strong>
                    {lastModified.at && ` on ${new Date(lastModified.at).toLocaleString()}`}
                </span>
            </div>

            {/* Add Module Modal */}
            {showAddModal && (
                <div style={ModalOverlayStyle}>
                    <div style={ModalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Add New Module</h3>
                            <button onClick={() => { setShowAddModal(false); setAddError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <XCircle size={22} color="#64748b" />
                            </button>
                        </div>

                        {addError && (
                            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '6px', color: '#dc2626', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} /> {addError}
                            </div>
                        )}

                        <form onSubmit={handleAddRule}>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={LabelStyle}>Feature Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Vendors, Events, Reports"
                                    style={InputStyle}
                                    value={newRule.feature}
                                    onChange={e => setNewRule({ ...newRule, feature: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div style={{ marginBottom: '14px' }}>
                                <label style={LabelStyle}>Module Group *</label>
                                <select
                                    style={InputStyle}
                                    value={newRule.module}
                                    onChange={e => setNewRule({ ...newRule, module: e.target.value })}
                                >
                                    <option value="Sales">Sales</option>
                                    <option value="Activities">Activities</option>
                                    <option value="Inventory">Inventory</option>
                                    <option value="Management">Management</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={LabelStyle}>Available Permissions *</label>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                    {['Read', 'Write', 'Delete'].map(perm => (
                                        <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#475569' }}>
                                            <input
                                                type="checkbox"
                                                checked={newRule.availablePermissions.includes(perm)}
                                                onChange={() => {
                                                    const perms = newRule.availablePermissions.includes(perm)
                                                        ? newRule.availablePermissions.filter(p => p !== perm)
                                                        : [...newRule.availablePermissions, perm];
                                                    setNewRule({ ...newRule, availablePermissions: perms });
                                                }}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            {perm === 'Read' ? 'View (Read)' : perm === 'Write' ? 'Create/Edit' : 'Delete'}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); setAddError(''); }}
                                    style={{ ...SecondaryBtnStyle, flex: 1, justifyContent: 'center' }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" style={{ ...PrimaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                                    Add Module
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={ModalOverlayStyle}>
                    <div style={{ ...ModalContentStyle, maxWidth: '380px', textAlign: 'center' }}>
                        <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Remove Module</h3>
                        <p style={{ color: '#64748b', marginBottom: '8px', fontSize: '14px' }}>
                            Are you sure you want to remove <strong>"{showDeleteModal.feature}"</strong>?
                        </p>
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '12px' }}>
                            This will revoke all permissions for this module.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowDeleteModal(null)} style={{ ...SecondaryBtnStyle, flex: 1, justifyContent: 'center' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteRule}
                                style={{ ...PrimaryBtnStyle, flex: 1, justifyContent: 'center', backgroundColor: '#ef4444' }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Checkbox Component
const Checkbox = ({ checked, onChange, disabled }) => (
    <div
        onClick={() => !disabled && onChange()}
        style={{
            width: '20px',
            height: '20px',
            border: `2px solid ${checked ? '#10b981' : '#d1d5db'}`,
            borderRadius: '4px',
            backgroundColor: checked ? '#10b981' : 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            opacity: disabled ? 0.6 : 1
        }}
    >
        {checked && (
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )}
    </div>
);

// Styles
const TableHeaderStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#64748b'
};

const PrimaryBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px'
};

const SecondaryBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'white',
    color: '#475569',
    border: '1px solid #e2e8f0',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '13px'
};

const ModalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const ModalContentStyle = {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const LabelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    display: 'block'
};

const InputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
};

export default AccessControl;
