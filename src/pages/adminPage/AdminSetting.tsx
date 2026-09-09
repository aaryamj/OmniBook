import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import DepartmentsConfig from './components/DepartmentsConfig';
import ClinicScheduleMatrix, { type ClinicScheduleMatrixHandle } from './components/ClinicScheduleMatrix';
import { useTheme } from '../../context/ThemeContext';
import { useOrganizationTerms, useDepartmentTerms } from '../../utils/organizationTerms';

export default function AdminSetting() {
    const terms = useOrganizationTerms();
    const deptTerms = useDepartmentTerms();
    const navigate = useNavigate();
    const { primaryAccentColor, setPrimaryAccentColor, saveTheme, isSaving: isSavingTheme } = useTheme();
    const [brandColor, setBrandColor] = useState(primaryAccentColor || '#003fb1');
    const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
    const scheduleMatrixRef = React.useRef<ClinicScheduleMatrixHandle>(null);
    const [scheduleBanner, setScheduleBanner] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [smsEnabled, setSmsEnabled] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [tenantData, setTenantData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Schedule States
    const [timezone, setTimezone] = useState('Asia/Kathmandu');
    const [slotDuration, setSlotDuration] = useState('30');
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('17:00');
    const [isSaving, setIsSaving] = useState(false);

    // Security States
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('30');
    const [rolesData, setRolesData] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    // Toast Notification State
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Role Modal States & Granular Feature Permissions
    interface RolePermissions {
        calendar: { read: boolean; write: boolean };
        patients: { read: boolean; write: boolean };
        services: { read: boolean; write: boolean };
        analytics: { read: boolean; write: boolean };
    }

    const defaultRolePermissions: RolePermissions = {
        calendar: { read: true, write: true },
        patients: { read: true, write: true },
        services: { read: true, write: true },
        analytics: { read: false, write: false }
    };

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editRoleId, setEditRoleId] = useState<number | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newAccessScope, setNewAccessScope] = useState('Full Administrative Access');
    const [newPrivilegeLevel, setNewPrivilegeLevel] = useState('STANDARD');
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(defaultRolePermissions);
    const [isCreatingRole, setIsCreatingRole] = useState(false);

    // Role Deletion States
    const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
    const [isDeletingRole, setIsDeletingRole] = useState(false);

    // User Assignment States & Tab
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [roleToAssign, setRoleToAssign] = useState<any | null>(null);
    const [assignTab, setAssignTab] = useState<'existing' | 'new'>('existing');
    const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSavingAssignments, setIsSavingAssignments] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // New User Provisioning State inside Assign Modal
    const [newUserFullName, setNewUserFullName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPhone, setNewUserPhone] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('');
    const [showNewUserPassword, setShowNewUserPassword] = useState(false);
    const [showNewUserConfirmPassword, setShowNewUserConfirmPassword] = useState(false);
    const [newUserErrors, setNewUserErrors] = useState<{ [key: string]: string }>({});
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // Dynamic Multi-Org Scopes
    const availableScopes = React.useMemo(() => {
        const orgType = (tenantData?.organizationType || '').toLowerCase();
        if (orgType.includes('college') || orgType.includes('education') || orgType.includes('school') || orgType.includes('university')) {
            return [
                'Academic/Sessions & Schedules',
                'Student Records & Enrollment',
                'Department & Faculty Operations',
                'Tuition & Fee Invoicing',
                'Full Administrative Access',
                'Read-only Staff Access'
            ];
        } else if (orgType.includes('salon') || orgType.includes('spa') || orgType.includes('beauty') || orgType.includes('wellness')) {
            return [
                'Bookings & Stylist Schedules',
                'Client Profiles & Service History',
                'POS, Invoicing & Retail Checkout',
                'Staff Commission & Rosters',
                'Full Administrative Access',
                'Read-only Staff Access'
            ];
        } else if (orgType.includes('clinic') || orgType.includes('health') || orgType.includes('hospital')) {
            return [
                'Clinical/Appointments',
                'Patient Medical Records & EMR',
                'Calendar only, Restricted Ledger',
                'Billing & Invoicing',
                'Full Administrative Access',
                'Read-only Staff Access'
            ];
        }
        return [
            'Operations & Appointments',
            'Customer / Client Management',
            'Billing & Invoicing',
            'Full Administrative Access',
            'Calendar only, Restricted Ledger',
            'Read-only Staff Access'
        ];
    }, [tenantData?.organizationType]);

    useEffect(() => {
        fetchTenantData();
    }, []);

    useEffect(() => {
        if (tenantData) {
            if (tenantData.timezone) setTimezone(tenantData.timezone);
            if (tenantData.slotDuration) setSlotDuration(tenantData.slotDuration.toString());
            if (tenantData.openingTime) setOpeningTime(tenantData.openingTime.substring(0, 5));
            if (tenantData.closingTime) setClosingTime(tenantData.closingTime.substring(0, 5));
            if (tenantData.twoFactorEnabled != null) setTwoFactorEnabled(tenantData.twoFactorEnabled);
            if (tenantData.sessionTimeout != null) setSessionTimeout(tenantData.sessionTimeout.toString());
            if (tenantData.primaryAccentColor) {
                setBrandColor(tenantData.primaryAccentColor);
                setPrimaryAccentColor(tenantData.primaryAccentColor);
            }
        }
    }, [tenantData]);

    const handleSaveBranding = async () => {
        const success = await saveTheme(brandColor);
        if (success) {
            setSaveSuccessMsg("Institutional branding updated successfully!");
            setTimeout(() => setSaveSuccessMsg(''), 4000);
            fetchTenantData();
        } else {
            alert("Failed to update institutional branding. Please check your connection.");
        }
    };

    const fetchTenantData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/tenant/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTenantData(response.data);
        } catch (error) {
            console.error("Failed to fetch tenant data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSchedule = async () => {
        setIsSaving(true);
        setScheduleBanner(null);
        try {
            let success = false;
            if (scheduleMatrixRef.current) {
                success = await scheduleMatrixRef.current.save();
            }
            if (success) {
                setScheduleBanner({
                    type: 'success',
                    message: 'Operating hours and provider schedules synchronized successfully!'
                });
                showToast("Operating hours and provider schedules synchronized successfully!", "success");
                setTimeout(() => setScheduleBanner(null), 6000);
            } else {
                setScheduleBanner({
                    type: 'error',
                    message: 'Failed to update schedule. Please check break time boundaries and values.'
                });
                showToast("Failed to update schedule", "error");
                setTimeout(() => setScheduleBanner(null), 6000);
            }
        } catch (error: any) {
            const err = error.response?.data?.message || error.message || "Failed to update schedule";
            setScheduleBanner({
                type: 'error',
                message: err
            });
            showToast(err, "error");
            setTimeout(() => setScheduleBanner(null), 6000);
        } finally {
            setIsSaving(false);
        }
    };

    const fetchSecurityData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [rolesRes, logsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/security/roles', { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get('http://localhost:8080/api/v1/security/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setRolesData(rolesRes.data);
            setAuditLogs(logsRes.data);
        } catch (error) {
            console.error("Failed to fetch security data", error);
        }
    };

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSecurityData();
        }
    }, [activeTab]);

    const handleUpdateSecurity = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('twoFactorEnabled', twoFactorEnabled.toString());
            formData.append('sessionTimeout', sessionTimeout);

            const response = await axios.put('http://localhost:8080/api/v1/tenant/profile', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                showToast("Security settings & authentication rules updated successfully!");
                setTenantData(response.data.tenant);
            }
        } catch (error: any) {
            console.error("Failed to update security settings", error);
            showToast(error.response?.data?.message || "Failed to update security settings", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingRole(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                roleName: newRoleName,
                accessScope: newAccessScope,
                privilegeLevel: newPrivilegeLevel,
                permissionsJson: JSON.stringify(rolePermissions)
            };
            
            let response;
            if (editRoleId) {
                response = await axios.put(`http://localhost:8080/api/v1/security/roles/${editRoleId}`, payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                response = await axios.post('http://localhost:8080/api/v1/security/roles', payload, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                showToast(`Role ${editRoleId ? 'updated' : 'created'} successfully!`);
                closeRoleModal();
                fetchSecurityData();
            }
        } catch (error: any) {
            console.error(`Failed to ${editRoleId ? 'update' : 'create'} role`, error);
            showToast(error.response?.data?.message || `Failed to ${editRoleId ? 'update' : 'create'} role`, "error");
        } finally {
            setIsCreatingRole(false);
        }
    };

    const openCreateRoleModal = () => {
        setEditRoleId(null);
        setNewRoleName('');
        setNewAccessScope(availableScopes[0] || 'Full Administrative Access');
        setNewPrivilegeLevel('STANDARD');
        setRolePermissions(defaultRolePermissions);
        setIsRoleModalOpen(true);
    };

    const openEditRoleModal = (role: any) => {
        setEditRoleId(role.id);
        setNewRoleName(role.roleName);
        setNewAccessScope(role.accessScope || availableScopes[0] || 'Full Administrative Access');
        setNewPrivilegeLevel(role.privilegeLevel === 'HIGH_PRIVILEGE' || role.privilegeLevel === 'HIGH PRIVILEGE' ? 'HIGH_PRIVILEGE' : 'STANDARD');
        if (role.permissionsJson) {
            try {
                const parsed = JSON.parse(role.permissionsJson);
                setRolePermissions({
                    calendar: { read: !!parsed.calendar?.read, write: !!parsed.calendar?.write },
                    patients: { read: !!parsed.patients?.read, write: !!parsed.patients?.write },
                    services: { read: !!parsed.services?.read, write: !!parsed.services?.write },
                    analytics: { read: !!parsed.analytics?.read, write: !!parsed.analytics?.write }
                });
            } catch (e) {
                setRolePermissions(defaultRolePermissions);
            }
        } else {
            setRolePermissions(defaultRolePermissions);
        }
        setIsRoleModalOpen(true);
    };

    const closeRoleModal = () => {
        setIsRoleModalOpen(false);
        setEditRoleId(null);
    };

    // Role Deletion Handlers
    const openDeleteConfirmModal = (role: any) => {
        setRoleToDelete(role);
    };

    const closeDeleteConfirmModal = () => {
        setRoleToDelete(null);
    };

    const handleConfirmDeleteRole = async () => {
        if (!roleToDelete) return;
        setIsDeletingRole(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:8080/api/v1/security/roles/${roleToDelete.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                showToast(`Role "${roleToDelete.roleName}" deleted successfully. Any linked users were unlinked.`);
                closeDeleteConfirmModal();
                fetchSecurityData();
            } else {
                showToast(response.data.message || "Failed to delete role", "error");
            }
        } catch (error: any) {
            console.error("Failed to delete role", error);
            showToast(error.response?.data?.message || "Failed to delete role", "error");
        } finally {
            setIsDeletingRole(false);
        }
    };

    // User Assignment Handlers
    const openAssignUsersModal = async (role: any) => {
        setRoleToAssign(role);
        setAssignTab('existing');
        setNewUserFullName('');
        setNewUserEmail('');
        setNewUserPhone('');
        setNewUserPassword('');
        setNewUserConfirmPassword('');
        setShowNewUserPassword(false);
        setShowNewUserConfirmPassword(false);
        setNewUserErrors({});
        setIsAssignModalOpen(true);
        setIsLoadingUsers(true);
        setUserSearchTerm('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/v1/security/roles/${role.id}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = res.data || [];
            setAssignableUsers(users);
            const assignedIds = users.filter((u: any) => u.isAssigned).map((u: any) => u.id);
            setSelectedUserIds(assignedIds);
        } catch (err) {
            console.error("Failed to fetch assignable users", err);
            showToast("Failed to load staff list for role assignment", "error");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const closeAssignUsersModal = () => {
        setIsAssignModalOpen(false);
        setRoleToAssign(null);
        setAssignableUsers([]);
        setSelectedUserIds([]);
        setAssignTab('existing');
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSaveAssignments = async () => {
        if (!roleToAssign) return;
        setIsSavingAssignments(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8080/api/v1/security/roles/${roleToAssign.id}/assign`, {
                userIds: selectedUserIds
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                showToast(`Staff assigned to "${roleToAssign.roleName}" updated successfully!`);
                closeAssignUsersModal();
                fetchSecurityData();
            } else {
                showToast(response.data.message || "Failed to update user assignments", "error");
            }
        } catch (error: any) {
            console.error("Failed to update assignments", error);
            showToast(error.response?.data?.message || "Failed to update user assignments", "error");
        } finally {
            setIsSavingAssignments(false);
        }
    };

    const validateNewUserForm = () => {
        const errors: { [key: string]: string } = {};
        if (!newUserFullName.trim()) {
            errors.fullName = 'Full Name is required';
        } else if (newUserFullName.trim().length < 2) {
            errors.fullName = 'Full Name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newUserEmail.trim()) {
            errors.email = 'Email address is required';
        } else if (!emailRegex.test(newUserEmail.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        const phoneRegex = /^\d{10}$/;
        if (!newUserPhone.trim()) {
            errors.phone = 'Mobile number is required';
        } else if (!phoneRegex.test(newUserPhone.trim())) {
            errors.phone = 'Phone number must be exactly 10 digits';
        }

        const passwordRegex = /^(?=.*\d)(?=.*[^a-zA-Z0-9])[A-Z].{5,}$/;
        if (!newUserPassword) {
            errors.password = 'Password is required';
        } else if (!passwordRegex.test(newUserPassword)) {
            errors.password = 'Must be 6+ chars, start with a capital letter, and include a number and symbol';
        }

        if (!newUserConfirmPassword) {
            errors.confirmPassword = 'Confirm Password is required';
        } else if (newUserPassword !== newUserConfirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setNewUserErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateAndAssignUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateNewUserForm() || !roleToAssign) return;

        setIsCreatingUser(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8080/api/v1/security/roles/${roleToAssign.id}/create-user`, {
                fullName: newUserFullName.trim(),
                email: newUserEmail.trim(),
                phone: newUserPhone.trim(),
                password: newUserPassword
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                showToast(`User "${newUserFullName}" created and assigned to "${roleToAssign.roleName}"!`);
                setNewUserFullName('');
                setNewUserEmail('');
                setNewUserPhone('');
                setNewUserPassword('');
                setNewUserConfirmPassword('');
                setNewUserErrors({});
                
                // Refresh list of users for this role
                const res = await axios.get(`http://localhost:8080/api/v1/security/roles/${roleToAssign.id}/users`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const users = res.data || [];
                setAssignableUsers(users);
                const assignedIds = users.filter((u: any) => u.isAssigned).map((u: any) => u.id);
                setSelectedUserIds(assignedIds);
                setAssignTab('existing');
                fetchSecurityData();
            } else {
                showToast(response.data.message || 'Failed to create and assign user', 'error');
            }
        } catch (error: any) {
            console.error('Failed to create and assign user', error);
            showToast(error.response?.data?.message || 'Failed to create and assign user', 'error');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const exportAuditLogs = () => {
        if (auditLogs.length === 0) {
            alert("No logs to export.");
            return;
        }

        const headers = ['User', 'Event Action', 'Timestamp', 'Source IP'];
        const csvContent = [
            headers.join(','),
            ...auditLogs.map((log: any) => 
                `"${log.user?.fullName || 'Unknown'}","${log.eventAction}","${new Date(log.timestamp).toLocaleString()}","${log.sourceIp}"`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="tenant-theme">
            <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />
                
                <main className="lg:ml-[280px] ml-0 ml-sidebar-width pt-24 flex flex-col h-screen overflow-hidden">
                    {/* Page Header & Actions */}
                    <section className="px-gutter pb-4 flex justify-between items-end bg-background">
                        <div>
                            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/settings')}>Settings</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest text-secondary font-bold">
                                    {activeTab === 'profile' ? 'General Profile' : activeTab === 'gateways' ? 'Payment Gateways' : activeTab === 'hours' ? 'Operating Hours' : activeTab === 'security' ? 'Security & Permissions' : activeTab === 'departments' ? deptTerms.badgeLabel + 's' : 'Configuration'}
                                </span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
                                {activeTab === 'profile' ? `${terms.facilityLabel} Identity & Compliance` : activeTab === 'gateways' ? 'Financial Integrations' : activeTab === 'hours' ? `${terms.facilityLabel} Schedule Matrix` : activeTab === 'security' ? 'Security & Access Control' : activeTab === 'departments' ? deptTerms.entityTitle : 'Tenant Configuration'}
                            </h2>
                            <p className="text-on-surface-variant mt-1">
                                {activeTab === 'profile' 
                                    ? `Manage ${terms.facilityLabel.toLowerCase()} identity, contact details, and geolocation.` 
                                    : activeTab === 'gateways'
                                    ? 'Configure global credit card processing and regional digital wallets.'
                                    : activeTab === 'hours'
                                    ? 'Set system timezone, booking intervals, and weekly availability.'
                                    : activeTab === 'security'
                                    ? 'Manage global authentication rules, active roles, and system activity.'
                                    : activeTab === 'departments'
                                    ? `Define structural departments to categorize ${terms.providerPlural.toLowerCase()} and ${terms.servicePlural.toLowerCase()}.`
                                    : 'Manage global enterprise settings, white-label assets, and financial integrations.'}
                            </p>
                        </div>
                        {activeTab === 'gateways' ? (
                            <div className="flex gap-3">
                                <button className="px-5 py-2.5 border border-outline-variant bg-white text-on-surface font-label-md text-label-md rounded shadow-sm hover:bg-surface-container-low transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">terminal</span>
                                    Test Webhooks
                                </button>
                                <button className="px-5 py-2.5 bg-secondary-container text-on-secondary-fixed-variant font-bold text-label-md rounded shadow-md hover:brightness-110 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Save API Keys
                                </button>
                            </div>
                        ) : activeTab === 'hours' ? (
                            <button 
                                onClick={handleUpdateSchedule}
                                disabled={isSaving}
                                className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:brightness-105 transition-all shadow-sm disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">save</span>
                                {isSaving ? 'Saving...' : 'Update Schedule'}
                            </button>
                        ) : activeTab === 'security' ? (
                            <button 
                                onClick={handleUpdateSecurity}
                                disabled={isSaving}
                                className="bg-[#2DD4BF] text-white font-label-md text-label-md px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:bg-teal-500 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">verified_user</span>
                                {isSaving ? 'Saving...' : 'Save Security Policy'}
                            </button>
                        ) : (
                            <button 
                                onClick={handleSaveBranding}
                                disabled={isSavingTheme}
                                className="bg-primary hover:brightness-110 text-on-primary px-6 py-2.5 rounded font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                {isSavingTheme ? 'Saving...' : `Save ${activeTab === 'profile' ? 'Profile' : 'Configuration'}`}
                            </button>
                        )}
                    </section>

                    {/* Dual Column Workspace */}
                    <div className="flex-1 px-gutter pb-8 flex gap-gutter overflow-hidden">
                        {/* Left Inner Menu (25%) */}
                        <aside className="w-72 flex-shrink-0">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-outline-variant bg-surface-container-low">
                                    <h3 className="font-label-md text-label-md font-black uppercase text-on-surface-variant">Configuration Layers</h3>
                                </div>
                                <nav className="flex flex-col">
                                    <button 
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'profile' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : ""}}>domain</span>
                                            General Profile
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('branding')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'branding' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'branding' ? "'FILL' 1" : ""}}>palette</span>
                                            Branding & White-Label
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('gateways')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'gateways' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'gateways' ? "'FILL' 1" : ""}}>payments</span>
                                            Payment Gateways
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('hours')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'hours' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'hours' ? "'FILL' 1" : ""}}>schedule</span>
                                            Operating Hours
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('security')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'security' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : ""}}>security</span>
                                            Security & Permissions
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('departments')}
                                        className={`flex items-center justify-between px-5 py-4 transition-colors font-body-md text-body-md ${activeTab === 'departments' ? 'bg-secondary-container/10 border-r-4 border-secondary text-secondary font-bold' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'departments' ? "'FILL' 1" : ""}}>{deptTerms.icon}</span>
                                            {deptTerms.badgeLabel + 's'}
                                        </span>
                                    </button>
                                </nav>
                            </div>
                            <div className="mt-6 p-4 bg-tertiary-container rounded-xl text-white">
                                <p className="font-label-md text-[10px] uppercase text-on-tertiary-container mb-2">Live Node Status</p>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-1 bg-primary-container rounded-full overflow-hidden">
                                        <div className="bg-secondary-container h-full w-3/4"></div>
                                    </div>
                                    <span className="font-mono-data text-[10px]">75% Synced</span>
                                </div>
                                <p className="font-body-md text-xs text-on-primary-container">Cloud replication active across EU-Central clusters.</p>
                            </div>
                        </aside>

                        {/* Right Inner Form (75%) */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                                
                                {/* DEPARTMENTS TAB CONTENT */}
                                {activeTab === 'departments' && (
                                    <DepartmentsConfig />
                                )}

                                {/* GENERAL PROFILE TAB CONTENT */}
                                {activeTab === 'profile' && (
                                    <>
                                        {/* Top Banner */}
                                        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                                            <div className="flex gap-8">
                                                <div className="flex flex-col">
                                                    <span className="font-label-md text-[10px] uppercase text-outline">Tenant ID</span>
                                                    <span className="font-mono-data text-mono-data font-bold">{tenantData ? `OMNI-NP-${tenantData.id}` : 'Loading...'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-label-md text-[10px] uppercase text-outline">Subscription</span>
                                                    <span className="font-body-md text-body-md font-bold text-secondary">{tenantData?.subscriptionTier || 'Enterprise Tier'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-on-secondary-container/5 border border-on-secondary-container/20 rounded">
                                                <span className="material-symbols-outlined text-[#22C55E] text-lg" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                <span className="font-label-md text-label-md font-bold uppercase text-on-secondary-container">Status: {tenantData?.status || 'Active'}</span>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-12">
                                            {/* Section 1: Official Identity */}
                                            <section>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                                                    <h3 className="font-headline-md text-headline-md">Official Identity</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Registered {terms.facilityLabel} Name</label>
                                                        <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all" type="text" value={tenantData?.organizationName || ''} readOnly />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="font-label-md text-label-md text-on-surface-variant uppercase">{terms.registrationLabel}</label>
                                                        <div className="relative">
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all" type="text" value={tenantData?.registrationNumber || ''} readOnly />
                                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#22C55E]">verified</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Section 2: Contact Information */}
                                            <section>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                                                    <h3 className="font-headline-md text-headline-md">Contact Information</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-12">
                                                    {/* Public Facing */}
                                                    <div className="space-y-4">
                                                        <p className="font-label-md text-label-md text-secondary font-bold uppercase tracking-widest border-b border-secondary/20 pb-2">Public Facing</p>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-label-md text-[10px] text-on-surface-variant uppercase">Phone Number</label>
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="tel" value={tenantData?.phoneContact || 'N/A'} readOnly />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-label-md text-[10px] text-on-surface-variant uppercase">Public Email</label>
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="email" value={tenantData?.email || 'N/A'} readOnly />
                                                        </div>
                                                    </div>
                                                    {/* Administrative */}
                                                    <div className="space-y-4">
                                                        <p className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-widest border-b border-outline-variant pb-2">Administrative Billing</p>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-label-md text-[10px] text-on-surface-variant uppercase">Billing Email</label>
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="email" value={tenantData?.email || 'N/A'} readOnly />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-label-md text-[10px] text-on-surface-variant uppercase">Finance Contact Person</label>
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="text" value={tenantData?.adminName || localStorage.getItem('adminFullName') || localStorage.getItem('fullName') || 'Admin'} readOnly />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Section 3: Geolocation & Address */}
                                            <section>
                                                <div className="flex items-center gap-2 mb-6">
                                                    <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                                                    <h3 className="font-headline-md text-headline-md">Geolocation & Address</h3>
                                                </div>
                                                <div className="grid grid-cols-12 gap-8">
                                                    <div className="col-span-7 space-y-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="font-label-md text-label-md text-on-surface-variant uppercase">Street Address</label>
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="text" value={tenantData?.address || 'N/A'} readOnly />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col gap-2">
                                                                <label className="font-label-md text-label-md text-on-surface-variant uppercase">City/Province</label>
                                                                <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="text" value="N/A" readOnly />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="font-label-md text-label-md text-on-surface-variant uppercase">Postal Code</label>
                                                                <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="text" value="N/A" readOnly />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 p-3 bg-surface-container-low border border-outline-variant rounded">
                                                            <span className="material-symbols-outlined text-outline">info</span>
                                                            <p className="font-body-md text-xs text-on-surface-variant">Address changes require manual verification by regional authorities if the subscription is in the Compliance Tier.</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-5">
                                                        <label className="font-label-md text-label-md text-on-surface-variant uppercase block mb-2">Map Reference</label>
                                                        <div className="relative w-full h-[220px] rounded-lg border border-outline-variant overflow-hidden group shadow-inner">
                                                            <div className="absolute inset-0 bg-slate-200" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDneu_7IAYu0wrUUrldHDHs4XRaNudJl8fmXCsg7jCtsoqSytIc7EbEFUqpAh2kgdVHFU8K_8fEOzT6e2ojGLrvjEWB0h2bYN9nJzU69G9bfW6zbArXms9VHoKd818T-3AlxZAQW5HfCVJOO9K28IMtEnNNv649Y3-y-2sTRaLnyX4ClqrZMu1uBzQBIKC0Sz7isitN36uR602cEF5l4nAESAzK7eC498BnJ3Xzru4ePwqRcQO28epX')", backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                                            <div className="absolute top-4 right-4 z-10">
                                                                <button className="bg-white/90 backdrop-blur p-2 rounded shadow-md hover:bg-white transition-colors">
                                                                    <span className="material-symbols-outlined text-on-surface">open_in_new</span>
                                                                </button>
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="w-10 h-10 rounded-full bg-secondary/20 animate-ping absolute"></div>
                                                                <span className="material-symbols-outlined text-secondary text-4xl drop-shadow-lg relative z-10" style={{fontVariationSettings: "'FILL' 1"}}>location_on</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </>
                                )}

                                {/* BRANDING TAB CONTENT */}
                                {activeTab === 'branding' && (
                                    <div className="p-8 space-y-12">
                                        {/* Section 1: Facility Branding */}
                                        <section>
                                    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                        <span className="material-symbols-outlined text-[#0D9488]">auto_awesome</span>
                                        <h3 className="font-headline-md text-headline-md text-primary">{terms.customerSingular} Portal Branding</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div>
                                            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Enterprise Logo</label>
                                            <div className="relative group cursor-pointer border-2 border-dashed border-outline-variant rounded-lg p-10 flex flex-col items-center justify-center bg-[#F8FAFC] hover:bg-surface-container-low transition-all">
                                                <div className="mb-4 bg-white p-4 rounded shadow-sm">
                                                    <div className="w-32 h-12 flex items-center justify-center font-bold text-primary italic border-2 border-primary/10">
                                                        MediGlobal
                                                    </div>
                                                </div>
                                                <p className="text-on-surface-variant font-label-md text-label-md">Drag & Drop Logo Here</p>
                                                <p className="text-on-surface-variant/60 text-[11px] mt-1">SVG, PNG or JPEG (Max 2MB)</p>
                                                <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center space-y-4">
                                            <div>
                                                <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Institutional Primary Brand Color</label>
                                                <p className="text-on-surface-variant text-[12px] mb-3">Changes here automatically recompute your entire theme (buttons, headers, navigation, hover states, and WCAG-accessible text) across both Admin and Provider dashboards.</p>
                                            </div>

                                            {/* Live Picker & Hex Input */}
                                            <div className="flex items-center gap-4 bg-surface-container-low p-3.5 rounded-xl border border-outline-variant shadow-inner">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-black/10 cursor-pointer flex-shrink-0">
                                                    <input 
                                                        type="color" 
                                                        value={brandColor}
                                                        onChange={(e) => {
                                                            setBrandColor(e.target.value);
                                                            setPrimaryAccentColor(e.target.value);
                                                        }}
                                                        className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer opacity-0"
                                                        id="brandColorPicker"
                                                    />
                                                    <div className="w-full h-full" style={{ backgroundColor: brandColor }}></div>
                                                </div>

                                                <div className="flex-1">
                                                    <label htmlFor="brandColorPicker" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70 block">Hex Code</label>
                                                    <input 
                                                        className="bg-transparent border-none focus:ring-0 font-mono-data text-sm font-bold w-full outline-none" 
                                                        type="text" 
                                                        value={brandColor} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setBrandColor(val);
                                                            if (/^#[0-9A-F]{6}$/i.test(val)) {
                                                                setPrimaryAccentColor(val);
                                                            }
                                                        }}
                                                        style={{ color: brandColor }} 
                                                    />
                                                </div>

                                                <label 
                                                    htmlFor="brandColorPicker"
                                                    className="p-2.5 bg-white border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer shadow-sm flex items-center justify-center"
                                                    title="Click to pick color"
                                                >
                                                    <span className="material-symbols-outlined text-lg">colorize</span>
                                                </label>
                                            </div>

                                            {/* Preset Institutional Palettes */}
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-2">Recommended Brand Palettes</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { name: 'Royal Blue', hex: '#003fb1' },
                                                        { name: 'Medical Teal', hex: '#0D9488' },
                                                        { name: 'Cobalt', hex: '#2563EB' },
                                                        { name: 'Deep Violet', hex: '#7C3AED' },
                                                        { name: 'Emerald', hex: '#059669' },
                                                        { name: 'Amber Gold', hex: '#D97706' },
                                                        { name: 'Crimson', hex: '#DC2626' },
                                                        { name: 'Sky Azure', hex: '#0284C7' }
                                                    ].map(palette => (
                                                        <button
                                                            key={palette.hex}
                                                            type="button"
                                                            onClick={() => {
                                                                setBrandColor(palette.hex);
                                                                setPrimaryAccentColor(palette.hex);
                                                            }}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${brandColor.toLowerCase() === palette.hex.toLowerCase() ? 'ring-2 ring-primary border-primary shadow-sm' : 'border-outline-variant hover:bg-surface-container-low'}`}
                                                        >
                                                            <span className="w-3 h-3 rounded-full shadow-xs" style={{ backgroundColor: palette.hex }}></span>
                                                            <span className="text-on-surface">{palette.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Live Button Test Swatch */}
                                            <div className="pt-2">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70 block mb-1.5">Interactive Preview</span>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        type="button"
                                                        className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-xs shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                                                    >
                                                        Primary CTA Preview
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-lg font-bold text-xs hover:brightness-105 transition-all"
                                                    >
                                                        Secondary Button
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Financial Integrations */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                        <span className="material-symbols-outlined text-[#0D9488]">account_balance</span>
                                        <h3 className="font-headline-md text-headline-md text-primary">Financial Integrations</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Stripe Row */}
                                        <div className="flex items-center justify-between p-4 bg-white border border-outline-variant rounded hover:bg-[#F8FAFC] transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-8 bg-[#635BFF] rounded flex items-center justify-center text-white font-bold text-[12px]">Stripe</div>
                                                <div>
                                                    <p className="font-label-md text-label-md text-primary">Secret Live Key</p>
                                                    <code className="font-mono-data text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">sk_live_••••8392</code>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    Connected
                                                </span>
                                                <button className="text-on-surface-variant hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">settings_suggest</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* eSewa Row */}
                                        <div className="flex items-center justify-between p-4 bg-white border border-outline-variant rounded hover:bg-[#F8FAFC] transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-8 bg-[#41a124] rounded flex items-center justify-center text-white font-bold text-[12px]">eSewa</div>
                                                <div>
                                                    <p className="font-label-md text-label-md text-primary">Merchant ID</p>
                                                    <code className="font-mono-data text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">EPAY_••••44</code>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                    Connected
                                                </span>
                                                <button className="text-on-surface-variant hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">settings_suggest</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Operational Rules */}
                                <section>
                                    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                        <span className="material-symbols-outlined text-[#0D9488]">settings_ethernet</span>
                                        <h3 className="font-headline-md text-headline-md text-primary">Operational Rules</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        
                                        {/* Toggle Card */}
                                        <div className="bg-surface-container-low p-6 border border-outline-variant rounded-lg flex items-center justify-between">
                                            <div className="max-w-[70%]">
                                                <h4 className="font-label-md text-label-md text-primary font-bold">Automated Patient SMS Reminders</h4>
                                                <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">Send automated text notifications 24 hours prior to appointment start time.</p>
                                            </div>
                                            <div 
                                                className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer"
                                                onClick={() => setSmsEnabled(!smsEnabled)}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    name="toggle" 
                                                    id="sms_toggle" 
                                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer focus:outline-none transition-all duration-300" 
                                                    checked={smsEnabled}
                                                    readOnly
                                                    style={{
                                                        transform: smsEnabled ? 'translateX(100%)' : 'translateX(0)',
                                                        borderColor: smsEnabled ? '#0D9488' : '#cbd5e1' // primary vs outline-variant
                                                    }}
                                                />
                                                <label 
                                                    htmlFor="sms_toggle" 
                                                    className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300"
                                                    style={{ backgroundColor: smsEnabled ? '#0D9488' : '#e2e8f0' }}
                                                ></label>
                                            </div>
                                        </div>

                                        {/* Dropdown Card */}
                                        <div className="bg-surface-container-low p-6 border border-outline-variant rounded-lg">
                                            <label className="block font-label-md text-label-md text-primary font-bold mb-3">Default Appointment Slot Duration</label>
                                            <div className="relative">
                                                <select className="w-full bg-white border border-outline-variant rounded px-4 py-2.5 font-label-md text-label-md text-primary appearance-none focus:outline-none focus:border-[#0D9488] transition-all cursor-pointer" value={tenantData?.slotDuration ? `${tenantData.slotDuration} Minutes` : "30 Minutes"} disabled>
                                                    <option value="15 Minutes">15 Minutes</option>
                                                    <option value="30 Minutes">30 Minutes</option>
                                                    <option value="45 Minutes">45 Minutes</option>
                                                    <option value="60 Minutes">60 Minutes</option>
                                                    <option value="Custom Interval">Custom Interval</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant pointer-events-none">expand_more</span>
                                            </div>
                                            <p className="text-[11px] text-on-surface-variant mt-2">New providers will inherit this duration for their primary booking calendar.</p>
                                        </div>
                                        
                                    </div>
                                </section>

                                            {/* Advanced Data Visualization Placeholder */}
                                            <div className="bg-primary-container rounded-lg p-6 flex items-center justify-between border-l-4 border-secondary">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-on-primary-fixed-variant rounded">
                                                        <span className="material-symbols-outlined text-secondary">monitoring</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-bold font-label-md text-label-md">Audit Trail: Last Configuration Update</h4>
                                                        <p className="text-on-tertiary-container text-[12px]">Oct 24, 2023 at 09:42 AM by Admin <span className="font-mono-data text-secondary ml-2">#83921-A</span></p>
                                                    </div>
                                                </div>
                                                <button className="text-secondary font-label-md text-label-md hover:underline decoration-2 underline-offset-4">View Full History</button>
                                            </div>
                                        </div>
                                    )}

                                {/* GATEWAYS TAB CONTENT */}
                                {activeTab === 'gateways' && (
                                    <div className="p-8 space-y-6">
                                        {/* Warning Banner */}
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                                            </div>
                                            <div>
                                                <p className="font-body-md text-body-md text-amber-900 font-semibold">Security Protocol</p>
                                                <p className="font-body-md text-body-md text-amber-800 opacity-90">Keys are encrypted at rest. Never share your secret keys with OmniBook support.</p>
                                            </div>
                                        </div>

                                        {/* Stripe Card */}
                                        <section className="bg-white rounded-xl border border-surface-variant shadow-sm overflow-hidden transition-all hover:shadow-md">
                                            <div className="p-6 flex items-center justify-between border-b border-surface-variant">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#635BFF] rounded-lg flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M13.962 10.335c0-.492-.447-.762-1.26-.762-.767 0-1.534.213-2.156.541l-.419-3.307c.546-.249 1.545-.589 2.777-.589 3.008 0 4.92 1.535 4.92 4.127 0 3.08-4.159 3.49-4.159 4.188 0 .54.514.81 1.346.81.932 0 1.788-.235 2.328-.53l.459 3.331c-.628.324-1.743.628-3.058.628-3.069 0-5.025-1.541-5.025-4.249 0-3.417 4.249-3.776 4.249-4.708zm-1.448-7.335c-2.471 0-4.044 1.261-4.044 3.39 0 2.53 3.417 2.867 3.417 3.441 0 .443-.423.666-1.106.666-.767 0-1.464-.193-2.023-.464l-.382 3.054c.628.272 1.691.53 2.684.53 2.52 0 4.127-1.267 4.127-3.48 0-2.551-3.417-2.905-3.417-3.483 0-.43.41-.65.98-.65.719 0 1.264.151 1.767.369l.394-3.084c-.503-.193-1.408-.343-2.404-.343zM3.4 12h4v8H3.4v-8zm0-4.4h4v3.6H3.4V7.6zm13.2 0h4v12.4h-4V7.6z"></path>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-headline-md text-headline-md text-on-surface">Stripe Connect</h3>
                                                        <p className="font-body-md text-body-md text-on-surface-variant">Global credit card & wallet processing</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase rounded-full border border-emerald-200">Active</div>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide">Publishable Key</label>
                                                        <div className="relative">
                                                            <input className="w-full font-mono-data text-mono-data bg-surface-container-low border-surface-variant rounded-lg px-4 py-2.5 focus:ring-secondary-container" readOnly type="text" defaultValue="pk_live_51MxxxxxxxxxxxxxxxXT9" />
                                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-secondary">content_copy</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide">Secret Key</label>
                                                        <div className="relative">
                                                            <input className="w-full font-mono-data text-mono-data bg-surface-container-low border-surface-variant rounded-lg px-4 py-2.5 focus:ring-secondary-container" readOnly type="password" defaultValue="sk_live_v98shd9823h9d823hd92" />
                                                            <span className="material-symbols-outlined absolute right-12 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-secondary">visibility</span>
                                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-secondary">content_copy</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-tertiary-container p-3 px-6 flex items-center justify-between terminal-glow">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                    <p className="font-mono-data text-[12px] text-on-tertiary-container">Last ping received 2 mins ago <span className="opacity-50 mx-2">|</span> status: 200_OK</p>
                                                </div>
                                                <a className="text-[11px] font-mono-data text-secondary-container uppercase hover:underline" href="#">View Logs</a>
                                            </div>
                                        </section>

                                        {/* eSewa Card */}
                                        <section className="bg-white rounded-xl border border-surface-variant shadow-sm overflow-hidden transition-all hover:shadow-md">
                                            <div className="p-6 flex items-center justify-between border-b border-surface-variant">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#60BB46] rounded-lg flex items-center justify-center">
                                                        <span className="text-white font-black text-xl italic">e</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-headline-md text-headline-md text-on-surface">eSewa</h3>
                                                        <p className="font-body-md text-body-md text-on-surface-variant">Regional Digital Wallet (Nepal)</p>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase rounded-full border border-emerald-200">Active</div>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide">Merchant ID</label>
                                                        <div className="relative">
                                                            <input className="w-full font-mono-data text-mono-data bg-surface-container-low border-surface-variant rounded-lg px-4 py-2.5 focus:ring-secondary-container" readOnly type="password" defaultValue="MERCH_ID_99012" />
                                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-secondary">visibility</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="font-label-md text-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide">Local Settlement Bank Account</label>
                                                        <select className="w-full font-body-md text-body-md bg-white border-surface-variant rounded-lg px-4 py-2.5 focus:ring-secondary-container">
                                                            <option>Global IME Bank - xxxx9921</option>
                                                            <option>Nabil Bank - xxxx1102</option>
                                                            <option>Nepal Investment Bank - xxxx5543</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-lg bg-surface-container-low border border-dashed border-surface-variant">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="material-symbols-outlined text-secondary">info</span>
                                                            <p className="font-body-md text-body-md text-on-surface-variant">Automatic settlement configured for 12:00 AM daily.</p>
                                                        </div>
                                                        <button className="text-secondary font-bold text-[12px] uppercase">Modify Schedule</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Data Visualizer Atmospheric Element */}
                                        <div className="grid grid-cols-3 gap-6">
                                            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col gap-2">
                                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Global Volume (24h)</p>
                                                <p className="font-headline-lg text-headline-lg text-on-surface">$142,890.00</p>
                                                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden mt-2">
                                                    <div className="w-3/4 h-full bg-secondary"></div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col gap-2">
                                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">System Latency</p>
                                                <p className="font-headline-lg text-headline-lg text-emerald-600">42ms</p>
                                                <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">trending_down</span>
                                                    12% lower than yesterday
                                                </p>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl border border-surface-variant shadow-sm flex flex-col gap-2">
                                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Error Rate</p>
                                                <p className="font-headline-lg text-headline-lg text-on-surface">0.002%</p>
                                                <div className="flex gap-1 items-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* HOURS TAB CONTENT */}
                                {activeTab === 'hours' && (
                                    <div className="flex-1 flex flex-col">
                                        {scheduleBanner && (
                                            <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
                                                scheduleBanner.type === 'success' 
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined text-2xl ${scheduleBanner.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {scheduleBanner.type === 'success' ? 'verified' : 'error'}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-sm">
                                                            {scheduleBanner.type === 'success' ? 'Operating Schedule Synchronized' : 'Schedule Update Failed'}
                                                        </p>
                                                        <p className="text-xs opacity-90">{scheduleBanner.message}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setScheduleBanner(null)} className="p-1 hover:bg-black/5 rounded transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                </button>
                                            </div>
                                        )}
                                        <ClinicScheduleMatrix ref={scheduleMatrixRef} />
                                    </div>
                                )}

                                {/* SECURITY TAB CONTENT */}
                                {activeTab === 'security' && (
                                    <div className="flex-1 space-y-8 max-w-[1200px] p-6">
                                        {/* Section 1: Global Auth */}
                                        <section className="bg-white border border-surface-container-highest rounded-xl p-6 shadow-sm overflow-hidden relative">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="material-symbols-outlined text-secondary-container">lock_reset</span>
                                                <h3 className="font-headline-md text-headline-md">Global Authentication Rules</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-12">
                                                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-surface-container-highest">
                                                    <div>
                                                        <p className="font-label-md text-primary mb-1">Two-Factor Authentication (2FA)</p>
                                                        <p className="text-body-md text-on-surface-variant">Mandatory for all admin level accounts</p>
                                                    </div>
                                                    <button 
                                                        aria-checked={twoFactorEnabled} 
                                                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? 'bg-[#10B981]' : 'bg-surface-container-high'}`} 
                                                        role="switch"
                                                    >
                                                        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-surface-container-highest">
                                                    <div>
                                                        <p className="font-label-md text-primary mb-1">Session Timeout</p>
                                                        <p className="text-body-md text-on-surface-variant">Inactivity period before logout</p>
                                                    </div>
                                                    <select 
                                                        className="bg-white border-outline-variant rounded-lg text-label-md px-3 py-2 focus:ring-secondary-container focus:border-secondary-container"
                                                        value={sessionTimeout}
                                                        onChange={(e) => setSessionTimeout(e.target.value)}
                                                    >
                                                        <option value="15">15 minutes</option>
                                                        <option value="30">30 minutes</option>
                                                        <option value="60">60 minutes</option>
                                                        <option value="240">4 hours</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Section 2: Roles & Permissions */}
                                        <section className="bg-white border border-surface-container-highest rounded-xl shadow-sm overflow-hidden">
                                            <div className="p-6 border-b border-surface-container-highest flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-secondary-container">shield_person</span>
                                                    <h3 className="font-headline-md text-headline-md">Active Roles & Permissions</h3>
                                                </div>
                                                <button onClick={openCreateRoleModal} className="text-secondary font-label-md text-label-md hover:underline">+ Define New Role</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-surface-container-low">
                                                        <tr>
                                                            <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Role Name</th>
                                                            <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Access Scope</th>
                                                            <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Privilege Level</th>
                                                            <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-surface-container-highest">
                                                        {rolesData.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                                                                    No custom roles defined yet. Click "+ Define New Role" to create one.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            rolesData.map((role: any) => (
                                                                <tr key={role.id} className="hover:bg-surface-container-lowest transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <p className="font-label-md text-primary">{role.roleName}</p>
                                                                        <p className="text-xs text-on-surface-variant">{role.assignedUsers || 0} assigned users</p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-body-md">
                                                                        <p className="font-medium text-on-surface">{role.accessScope}</p>
                                                                        {role.permissionsJson && (
                                                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                                                {(() => {
                                                                                    try {
                                                                                        const p = JSON.parse(role.permissionsJson);
                                                                                        const labels: { [k: string]: string } = {
                                                                                            calendar: 'Calendar',
                                                                                            patients: 'Clients',
                                                                                            services: 'Services',
                                                                                            analytics: 'Analytics'
                                                                                        };
                                                                                        return Object.entries(p).map(([key, val]: [string, any]) => {
                                                                                            if (!val.read && !val.write) return null;
                                                                                            return (
                                                                                                <span key={key} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                                                                                                    <span className={`w-1.5 h-1.5 rounded-full ${val.write ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                                                                                    {labels[key] || key}: {val.write ? 'R/W' : 'Read'}
                                                                                                </span>
                                                                                            );
                                                                                        });
                                                                                    } catch(e) { return null; }
                                                                                })()}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`font-mono-data text-[10px] px-2 py-1 rounded border ${role.privilegeLevel === 'HIGH_PRIVILEGE' || role.privilegeLevel === 'HIGH PRIVILEGE' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                                            {role.privilegeLevel}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <button 
                                                                                title="Assign Staff / Users" 
                                                                                onClick={() => openAssignUsersModal(role)} 
                                                                                className="p-1.5 rounded-lg text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-1 group"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                                                                <span className="text-xs font-semibold hidden group-hover:inline">Assign</span>
                                                                            </button>
                                                                            <button 
                                                                                title="Edit Role" 
                                                                                onClick={() => openEditRoleModal(role)} 
                                                                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                                                                            </button>
                                                                            <button 
                                                                                title="Delete Role" 
                                                                                onClick={() => openDeleteConfirmModal(role)} 
                                                                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>

                                        {/* Section 3: Recent System Activity */}
                                        <section className="bg-white border border-surface-container-highest rounded-xl shadow-sm overflow-hidden">
                                            <div className="p-6 border-b border-surface-container-highest flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-secondary-container">manage_search</span>
                                                    <h3 className="font-headline-md text-headline-md">Recent System Activity</h3>
                                                </div>
                                                <button onClick={exportAuditLogs} className="bg-surface-container text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-high transition-colors">Export Logs (CSV)</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-surface-container-low border-b border-surface-container-highest">
                                                        <tr>
                                                            <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">User</th>
                                                            <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Event Action</th>
                                                            <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Timestamp</th>
                                                            <th className="px-6 py-4 font-label-md text-on-surface-variant uppercase tracking-wider">Source IP</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-surface-container-highest">
                                                        {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                                                            <tr key={log.id} className="hover:bg-surface-container-lowest transition-colors">
                                                                <td className="px-6 py-4 flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center text-[10px] font-bold">
                                                                        {log.user?.fullName?.substring(0, 2).toUpperCase() || 'U'}
                                                                    </div>
                                                                    <span className="font-label-md">{log.user?.fullName || 'Unknown User'}</span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                        <span className="text-body-md">{log.eventAction}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 font-mono-data text-xs text-on-surface-variant">
                                                                    {new Date(log.timestamp).toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-4 font-mono-data text-xs text-secondary">
                                                                    {log.sourceIp}
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant text-body-md">
                                                                    No recent system activity found.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="p-4 bg-surface-container-low text-center">
                                                <button className="text-label-md font-bold text-secondary uppercase tracking-widest hover:text-on-secondary-container transition-colors">View All Audit Logs</button>
                                            </div>
                                        </section>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Define New/Edit Role Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-surface-container flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-on-surface">{editRoleId ? 'Edit Role' : 'Define New Role'}</h2>
                                <p className="text-xs text-on-surface-variant mt-0.5">Configure role identity and tick specific feature access permissions</p>
                            </div>
                            <button onClick={closeRoleModal} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-6 flex-1 overflow-y-auto space-y-5 bg-surface-container-lowest">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-1.5">Role Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="e.g. Front Desk, Junior Provider, Registrar"
                                    required
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-1.5">Access Scope</label>
                                    <select 
                                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                                        value={newAccessScope}
                                        onChange={(e) => setNewAccessScope(e.target.value)}
                                        required
                                    >
                                        {availableScopes.map((scope) => (
                                            <option key={scope} value={scope}>{scope}</option>
                                        ))}
                                        {!availableScopes.includes(newAccessScope) && newAccessScope && (
                                            <option value={newAccessScope}>{newAccessScope}</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-on-surface mb-1.5">Privilege Level</label>
                                    <select 
                                        className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                                        value={newPrivilegeLevel}
                                        onChange={(e) => setNewPrivilegeLevel(e.target.value)}
                                    >
                                        <option value="STANDARD">Standard</option>
                                        <option value="HIGH_PRIVILEGE">High Privilege</option>
                                    </select>
                                </div>
                            </div>

                            {/* Granular Feature Permissions (Read & Write) */}
                            <div className="pt-2 border-t border-surface-container">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <label className="block text-sm font-bold text-on-surface">Feature Access & Permissions</label>
                                        <p className="text-[11px] text-on-surface-variant">Tick which features users with this role can read or write</p>
                                    </div>
                                    <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                                        Dynamic RBAC
                                    </span>
                                </div>

                                <div className="border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant/40 bg-white">
                                    {/* Header */}
                                    <div className="grid grid-cols-12 px-4 py-2 bg-surface-container-low text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                                        <div className="col-span-6">Feature</div>
                                        <div className="col-span-3 text-center">Read / View</div>
                                        <div className="col-span-3 text-center">Write / Edit</div>
                                    </div>

                                    {/* Calendar */}
                                    <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-surface-container-lowest transition-colors">
                                        <div className="col-span-6 flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
                                            <div>
                                                <p className="text-xs font-semibold text-on-surface">Master Calendar</p>
                                                <p className="text-[10px] text-on-surface-variant">Appointments, scheduling & time slots</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.calendar.read}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        calendar: { read: checked, write: checked ? prev.calendar.write : false }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.calendar.write}
                                                disabled={!rolePermissions.calendar.read}
                                                onChange={(e) => {
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        calendar: { ...prev.calendar, write: e.target.checked }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary disabled:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    {/* Clients / Patients / Students */}
                                    <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-surface-container-lowest transition-colors">
                                        <div className="col-span-6 flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-primary text-base">group</span>
                                            <div>
                                                <p className="text-xs font-semibold text-on-surface">Clients / Patients / Students</p>
                                                <p className="text-[10px] text-on-surface-variant">Profiles, records & interaction history</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.patients.read}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        patients: { read: checked, write: checked ? prev.patients.write : false }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.patients.write}
                                                disabled={!rolePermissions.patients.read}
                                                onChange={(e) => {
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        patients: { ...prev.patients, write: e.target.checked }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary disabled:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    {/* Services & Catalog */}
                                    <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-surface-container-lowest transition-colors">
                                        <div className="col-span-6 flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-primary text-base">design_services</span>
                                            <div>
                                                <p className="text-xs font-semibold text-on-surface">Services & Catalog</p>
                                                <p className="text-[10px] text-on-surface-variant">Offerings, packages & fee rates</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.services.read}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        services: { read: checked, write: checked ? prev.services.write : false }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.services.write}
                                                disabled={!rolePermissions.services.read}
                                                onChange={(e) => {
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        services: { ...prev.services, write: e.target.checked }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary disabled:opacity-30"
                                            />
                                        </div>
                                    </div>

                                    {/* Revenue & Analytics */}
                                    <div className="grid grid-cols-12 px-4 py-2.5 items-center hover:bg-surface-container-lowest transition-colors">
                                        <div className="col-span-6 flex items-center gap-2.5">
                                            <span className="material-symbols-outlined text-primary text-base">bar_chart</span>
                                            <div>
                                                <p className="text-xs font-semibold text-on-surface">Revenue & Analytics</p>
                                                <p className="text-[10px] text-on-surface-variant">Financial statistics & settlement ledger</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.analytics.read}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        analytics: { read: checked, write: checked ? prev.analytics.write : false }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary"
                                            />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <input 
                                                type="checkbox" 
                                                checked={rolePermissions.analytics.write}
                                                disabled={!rolePermissions.analytics.read}
                                                onChange={(e) => {
                                                    setRolePermissions(prev => ({
                                                        ...prev,
                                                        analytics: { ...prev.analytics, write: e.target.checked }
                                                    }));
                                                }}
                                                className="w-4 h-4 text-primary rounded cursor-pointer accent-primary disabled:opacity-30"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeRoleModal}
                                    className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isCreatingRole}
                                    className="px-4 py-2 font-bold bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isCreatingRole && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                    {editRoleId ? 'Update Role' : 'Save Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Assignment Modal */}
            {isAssignModalOpen && roleToAssign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-outline-variant/30">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-surface-container bg-surface-container-low">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
                                        <span className="material-symbols-outlined">group_add</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-on-surface">Assign Staff / Users</h2>
                                        <p className="text-xs text-on-surface-variant">Role: <span className="font-semibold text-primary">{roleToAssign.roleName}</span></p>
                                    </div>
                                </div>
                                <button onClick={closeAssignUsersModal} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex bg-surface-container rounded-xl p-1 gap-1">
                                <button
                                    type="button"
                                    onClick={() => setAssignTab('existing')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                        assignTab === 'existing'
                                            ? 'bg-white text-on-surface shadow-sm'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">group</span>
                                    Assign Existing Staff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAssignTab('new')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                        assignTab === 'new'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-sm">person_add</span>
                                    + Provision New User
                                </button>
                            </div>
                        </div>

                        {assignTab === 'existing' ? (
                            <>
                                {/* Search filter */}
                                <div className="p-4 border-b border-surface-container bg-surface-container-lowest">
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">search</span>
                                        <input 
                                            type="text"
                                            placeholder="Search staff by name or email..."
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                {/* User List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface-container-lowest divide-y divide-outline-variant/30">
                                    {isLoadingUsers ? (
                                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                                            <span className="material-symbols-outlined animate-spin text-2xl text-secondary">progress_activity</span>
                                            <p className="text-xs">Loading organization staff...</p>
                                        </div>
                                    ) : assignableUsers.length === 0 ? (
                                        <div className="py-12 text-center text-on-surface-variant text-sm">
                                            No users or staff found for this organization.
                                        </div>
                                    ) : (
                                        assignableUsers
                                            .filter(u => 
                                                (u.fullName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                                                (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
                                            )
                                            .map((user) => {
                                                const isChecked = selectedUserIds.includes(user.id);
                                                return (
                                                    <div 
                                                        key={user.id} 
                                                        onClick={() => toggleUserSelection(user.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isChecked ? 'bg-primary/5 border border-primary/20' : 'hover:bg-surface-container-low border border-transparent'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center uppercase">
                                                                {user.fullName ? user.fullName.substring(0, 2) : 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-on-surface">{user.fullName || 'User #' + user.id}</p>
                                                                <p className="text-xs text-on-surface-variant">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase">
                                                                {user.role}
                                                            </span>
                                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary border-primary text-white' : 'border-outline-variant bg-white'}`}>
                                                                {isChecked && <span className="material-symbols-outlined text-xs font-bold">check</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-between">
                                    <span className="text-xs text-on-surface-variant font-medium">
                                        {selectedUserIds.length} user{selectedUserIds.length === 1 ? '' : 's'} assigned
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            type="button" 
                                            onClick={closeAssignUsersModal}
                                            className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleSaveAssignments}
                                            disabled={isSavingAssignments || isLoadingUsers}
                                            className="px-5 py-2 text-sm font-bold bg-secondary-container text-on-secondary-container rounded-lg hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                        >
                                            {isSavingAssignments && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                            Save Assignments
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* New User Provisioning Form */
                            <form onSubmit={handleCreateAndAssignUser} className="flex-1 flex flex-col overflow-hidden bg-surface-container-lowest">
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                                        <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5 shrink-0">info</span>
                                        <div>
                                            <p className="font-semibold mb-0.5">Provisioning for Role: {roleToAssign.roleName}</p>
                                            <p className="text-blue-700">This user will log in with their email and the password set below, entering the Provider Portal with the permissions configured for this role.</p>
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface mb-1">Full Name *</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Ramesh Karki"
                                            value={newUserFullName}
                                            onChange={(e) => {
                                                setNewUserFullName(e.target.value);
                                                if (newUserErrors.fullName) setNewUserErrors(prev => ({ ...prev, fullName: '' }));
                                            }}
                                            className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all ${newUserErrors.fullName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                        />
                                        {newUserErrors.fullName && <p className="text-[11px] text-red-600 mt-1 font-medium">{newUserErrors.fullName}</p>}
                                    </div>

                                    {/* Gmail / Email */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface mb-1">Email / Gmail Address *</label>
                                        <input 
                                            type="email" 
                                            placeholder="e.g. user@gmail.com"
                                            value={newUserEmail}
                                            onChange={(e) => {
                                                setNewUserEmail(e.target.value);
                                                if (newUserErrors.email) setNewUserErrors(prev => ({ ...prev, email: '' }));
                                            }}
                                            className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all ${newUserErrors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                        />
                                        {newUserErrors.email && <p className="text-[11px] text-red-600 mt-1 font-medium">{newUserErrors.email}</p>}
                                    </div>

                                    {/* Mobile Number */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface mb-1">Mobile Number (10 digits) *</label>
                                        <input 
                                            type="tel" 
                                            placeholder="e.g. 9841234567"
                                            maxLength={10}
                                            value={newUserPhone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setNewUserPhone(val);
                                                if (newUserErrors.phone) setNewUserErrors(prev => ({ ...prev, phone: '' }));
                                            }}
                                            className={`w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm font-mono outline-none transition-all ${newUserErrors.phone ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                        />
                                        {newUserErrors.phone && <p className="text-[11px] text-red-600 mt-1 font-medium">{newUserErrors.phone}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface mb-1">Set User Password *</label>
                                        <div className="relative">
                                            <input 
                                                type={showNewUserPassword ? "text" : "password"}
                                                placeholder="e.g. Staff@1234"
                                                value={newUserPassword}
                                                onChange={(e) => {
                                                    setNewUserPassword(e.target.value);
                                                    if (newUserErrors.password) setNewUserErrors(prev => ({ ...prev, password: '' }));
                                                }}
                                                className={`w-full bg-white border rounded-lg pl-3.5 pr-10 py-2.5 text-sm outline-none transition-all ${newUserErrors.password ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowNewUserPassword(!showNewUserPassword)} 
                                                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">{showNewUserPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {newUserErrors.password ? (
                                            <p className="text-[11px] text-red-600 mt-1 font-medium">{newUserErrors.password}</p>
                                        ) : (
                                            <p className="text-[11px] text-on-surface-variant mt-1">6+ chars, start with uppercase, include a number and symbol</p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface mb-1">Confirm Password *</label>
                                        <div className="relative">
                                            <input 
                                                type={showNewUserConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm password"
                                                value={newUserConfirmPassword}
                                                onChange={(e) => {
                                                    setNewUserConfirmPassword(e.target.value);
                                                    if (newUserErrors.confirmPassword) setNewUserErrors(prev => ({ ...prev, confirmPassword: '' }));
                                                }}
                                                className={`w-full bg-white border rounded-lg pl-3.5 pr-10 py-2.5 text-sm outline-none transition-all ${newUserErrors.confirmPassword ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowNewUserConfirmPassword(!showNewUserConfirmPassword)} 
                                                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">{showNewUserConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {newUserErrors.confirmPassword && <p className="text-[11px] text-red-600 mt-1 font-medium">{newUserErrors.confirmPassword}</p>}
                                    </div>
                                </div>

                                {/* Form Footer */}
                                <div className="p-4 border-t border-surface-container bg-surface-container-low flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setAssignTab('existing')}
                                        className="px-4 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                                    >
                                        Back to List
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isCreatingUser}
                                        className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
                                    >
                                        {isCreatingUser && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                        Create & Assign User
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Role Confirmation Modal */}
            {roleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-outline-variant/30">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">Delete Custom Role</h3>
                            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                                Are you sure you want to delete the role <span className="font-bold text-on-surface">"{roleToDelete.roleName}"</span>?
                            </p>
                            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left flex items-start gap-2">
                                <span className="material-symbols-outlined text-amber-700 text-sm mt-0.5">warning</span>
                                <span>Any users currently assigned to this role will automatically have their custom role unlinked.</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-surface-container bg-surface-container-low flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={closeDeleteConfirmModal}
                                className="px-4 py-2 font-bold text-sm text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={handleConfirmDeleteRole}
                                disabled={isDeletingRole}
                                className="px-5 py-2 font-bold text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                {isDeletingRole && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                                Delete Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Floating Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in-right ${toast.type === 'error' ? 'bg-red-600 shadow-red-600/30' : 'bg-[#10B981] shadow-emerald-600/30'} text-white`}>
                    <span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                    <span className="font-bold text-sm">{toast.message}</span>
                </div>
            )}

            {/* Legacy Branding Toast */}
            {saveSuccessMsg && (
                <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-green-600/30 flex items-center gap-3 animate-slide-in-right">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-bold text-sm">{saveSuccessMsg}</span>
                </div>
            )}
        </div>
    );
}

