import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import DepartmentsConfig from './components/DepartmentsConfig';
import ClinicScheduleMatrix from './components/ClinicScheduleMatrix';

export default function AdminSetting() {
    const navigate = useNavigate();
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

    // Role Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editRoleId, setEditRoleId] = useState<number | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newAccessScope, setNewAccessScope] = useState('Clinical/Appointments');
    const [newPrivilegeLevel, setNewPrivilegeLevel] = useState('STANDARD');
    const [isCreatingRole, setIsCreatingRole] = useState(false);

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
        }
    }, [tenantData]);

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
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('timezone', timezone);
            formData.append('slotDuration', slotDuration);
            formData.append('openingTime', openingTime + ":00");
            formData.append('closingTime', closingTime + ":00");

            const response = await axios.put('http://localhost:8080/api/v1/tenant/profile', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                alert("Schedule updated successfully!");
                setTenantData(response.data.tenant);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to update schedule");
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
                alert("Security settings updated successfully!");
                setTenantData(response.data.tenant);
            }
        } catch (error: any) {
            console.error("Failed to update security settings", error);
            alert(error.response?.data?.message || "Failed to update security settings");
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
                privilegeLevel: newPrivilegeLevel
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
                alert(`Role ${editRoleId ? 'updated' : 'created'} successfully!`);
                closeRoleModal();
                fetchSecurityData();
            }
        } catch (error: any) {
            console.error(`Failed to ${editRoleId ? 'update' : 'create'} role`, error);
            alert(error.response?.data?.message || `Failed to ${editRoleId ? 'update' : 'create'} role`);
        } finally {
            setIsCreatingRole(false);
        }
    };

    const openCreateRoleModal = () => {
        setEditRoleId(null);
        setNewRoleName('');
        setNewAccessScope('Clinical/Appointments');
        setNewPrivilegeLevel('STANDARD');
        setIsRoleModalOpen(true);
    };

    const openEditRoleModal = (role: any) => {
        setEditRoleId(role.id);
        setNewRoleName(role.roleName);
        setNewAccessScope(role.accessScope || 'Clinical/Appointments');
        setNewPrivilegeLevel(role.privilegeLevel === 'HIGH_PRIVILEGE' || role.privilegeLevel === 'HIGH PRIVILEGE' ? 'HIGH_PRIVILEGE' : 'STANDARD');
        setIsRoleModalOpen(true);
    };

    const closeRoleModal = () => {
        setIsRoleModalOpen(false);
        setEditRoleId(null);
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
        <div className="superadmin-theme">
            <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative">
                <AdminSidebar />
                <TopNavigation />
                
                <main className="ml-sidebar-width pt-24 flex flex-col h-screen overflow-hidden">
                    {/* Page Header & Actions */}
                    <section className="px-gutter pb-4 flex justify-between items-end bg-background">
                        <div>
                            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/dashboard')}>Workspace</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/admin/settings')}>Settings</span>
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                                <span className="font-label-md text-label-md uppercase tracking-widest text-secondary font-bold">
                                    {activeTab === 'profile' ? 'General Profile' : activeTab === 'gateways' ? 'Payment Gateways' : activeTab === 'hours' ? 'Operating Hours' : activeTab === 'security' ? 'Security & Permissions' : activeTab === 'departments' ? 'Departments' : 'Configuration'}
                                </span>
                            </div>
                            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                                {activeTab === 'profile' ? 'Clinic Identity & Compliance' : activeTab === 'gateways' ? 'Financial Integrations' : activeTab === 'hours' ? 'Clinic Schedule Matrix' : activeTab === 'security' ? 'Security & Access Control' : activeTab === 'departments' ? 'Departments & Specializations' : 'Tenant Configuration'}
                            </h2>
                            <p className="text-on-surface-variant mt-1">
                                {activeTab === 'profile' 
                                    ? 'Manage clinic identity, contact details, and geolocation.' 
                                    : activeTab === 'gateways'
                                    ? 'Configure global credit card processing and regional digital wallets.'
                                    : activeTab === 'hours'
                                    ? 'Set system timezone, booking intervals, and weekly availability.'
                                    : activeTab === 'security'
                                    ? 'Manage global authentication rules, active roles, and system activity.'
                                    : activeTab === 'departments'
                                    ? 'Define structural departments to categorize providers and services.'
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
                            <button className="bg-[#0D9488] hover:bg-[#0b7a6f] text-white px-6 py-2.5 rounded font-label-md text-label-md flex items-center gap-2 shadow-sm transition-all active:scale-95">
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save {activeTab === 'profile' ? 'Profile' : 'Configuration'}
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
                                            <span className="material-symbols-outlined" style={{fontVariationSettings: activeTab === 'departments' ? "'FILL' 1" : ""}}>medication</span>
                                            Departments
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
                                                        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Registered Clinic Name</label>
                                                        <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none font-body-md text-body-md transition-all" type="text" value={tenantData?.organizationName || ''} readOnly />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <label className="font-label-md text-label-md text-on-surface-variant uppercase">Medical Board Registration No.</label>
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
                                                            <input className="w-full p-3 border border-outline-variant rounded bg-surface-bright font-body-md text-body-md" type="text" value={localStorage.getItem('fullName') || 'Admin'} readOnly />
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
                                        {/* Section 1: Clinic Branding */}
                                        <section>
                                    <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                        <span className="material-symbols-outlined text-[#0D9488]">auto_awesome</span>
                                        <h3 className="font-headline-md text-headline-md text-primary">Patient Portal Branding</h3>
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
                                        <div className="flex flex-col justify-center">
                                            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Primary Brand Color</label>
                                            <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded border border-outline-variant">
                                                <div className="w-12 h-12 rounded shadow-inner border border-white/20" style={{ backgroundColor: tenantData?.primaryAccentColor || '#0D9488' }}></div>
                                                <div className="flex-1">
                                                    <input className="bg-transparent border-none focus:ring-0 font-mono-data text-sm w-full outline-none" type="text" value={tenantData?.primaryAccentColor || '#0D9488'} readOnly style={{ color: tenantData?.primaryAccentColor || '#0D9488' }} />
                                                </div>
                                                <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">colorize</span>
                                            </div>
                                            <p className="text-on-surface-variant text-[12px] mt-3 italic">This color will be applied to patient portal headers, primary buttons, and booking confirmations.</p>
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
                                    <ClinicScheduleMatrix />
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
                                                                    <td className="px-6 py-4 text-body-md">{role.accessScope}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`font-mono-data text-[10px] px-2 py-1 rounded border ${role.privilegeLevel === 'HIGH_PRIVILEGE' || role.privilegeLevel === 'HIGH PRIVILEGE' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                                            {role.privilegeLevel}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <button onClick={() => openEditRoleModal(role)} className="text-on-surface-variant hover:text-primary transition-colors">
                                                                            <span className="material-symbols-outlined">edit_square</span>
                                                                        </button>
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
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-surface-container flex items-center justify-between">
                            <h2 className="text-xl font-bold text-on-surface">{editRoleId ? 'Edit Role' : 'Define New Role'}</h2>
                            <button onClick={closeRoleModal} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveRole} className="p-6 flex-1 overflow-y-auto space-y-6 bg-surface-container-lowest">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Role Name</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    placeholder="e.g. Front Desk, Junior Provider"
                                    required
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Access Scope</label>
                                <select 
                                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={newAccessScope}
                                    onChange={(e) => setNewAccessScope(e.target.value)}
                                    required
                                >
                                    <option value="Full Access">Full Access</option>
                                    <option value="Clinical/Appointments">Clinical/Appointments</option>
                                    <option value="Calendar only, Restricted Ledger">Calendar only, Restricted Ledger</option>
                                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                                    <option value="Read-only Access">Read-only Access</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Privilege Level</label>
                                <select 
                                    className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                    value={newPrivilegeLevel}
                                    onChange={(e) => setNewPrivilegeLevel(e.target.value)}
                                >
                                    <option value="STANDARD">Standard</option>
                                    <option value="HIGH_PRIVILEGE">High Privilege</option>
                                </select>
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
        </div>
    );
}
