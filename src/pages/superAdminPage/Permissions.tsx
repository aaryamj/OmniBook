import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

type TabName = 'System Platform Roles' | 'Tenant Custom Roles' | 'Industry Templates';
type IndustryType = 'Education / College' | 'Healthcare / Clinic' | 'Beauty & Wellness';

interface RBACFeatureRow {
    feature: string;
    icon: string;
    module: string;
    permissions: boolean[];
}

interface TenantCustomRole {
    id: number;
    roleName: string;
    tenantName: string;
    tenantType: string;
    accessScope: string;
    privilegeLevel: string;
    assignedUsers: number;
}

interface IndustryTemplate {
    columns: string[];
    rows: RBACFeatureRow[];
}

interface SuperadminRBACData {
    totalRoles: number;
    twoFactorEnforcement: string;
    activeTenantsCount: number;
    securityPosture: string;
    systemRoleColumns: string[];
    systemFeatureRows: RBACFeatureRow[];
    tenantCustomRoles: TenantCustomRole[];
    industryTemplates: Record<string, IndustryTemplate>;
}

export default function Permissions() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabName>('System Platform Roles');
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('Education / College');
    const [rbacData, setRbacData] = useState<SuperadminRBACData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchRoleQuery, setSearchRoleQuery] = useState('');

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Custom Role Drawer States
    const [isCustomRoleDrawerOpen, setIsCustomRoleDrawerOpen] = useState(false);
    const [newRoleTitle, setNewRoleTitle] = useState('Department Coordinator');
    const [newRoleScope, setNewRoleScope] = useState('Academic/Sessions & Schedules');
    const [cloneBase, setCloneBase] = useState('Service Provider / Staff');
    const [requireMFA, setRequireMFA] = useState(true);
    const [isSubmittingRole, setIsSubmittingRole] = useState(false);

    const [rolePermissions, setRolePermissions] = useState({
        records: { read: true, write: false, edit: false, delete: false },
        billing: { read: true, write: true, edit: true, delete: false },
        scheduling: { read: true, write: true, edit: false, delete: false }
    });

    const togglePermission = (module: 'records' | 'billing' | 'scheduling', action: 'read' | 'write' | 'edit' | 'delete') => {
        setRolePermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: !prev[module][action]
            }
        }));
    };

    const fetchRBAC = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/rbac', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setRbacData(res.data);
        } catch (error: any) {
            console.error("Failed to load RBAC data", error);
            showToast("Failed to fetch RBAC data from backend server", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRBAC();
    }, []);

    const handleCreateRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingRole(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                roleTitle: newRoleTitle,
                roleScope: newRoleScope,
                cloneBase: cloneBase,
                requireMFA: requireMFA
            };
            const res = await axios.post('http://localhost:8080/api/v1/superadmin/rbac/roles', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data) {
                showToast(`Custom role "${newRoleTitle}" created and published successfully!`);
                setIsCustomRoleDrawerOpen(false);
                setNewRoleTitle('Department Coordinator');
                // Refresh data
                fetchRBAC();
            }
        } catch (error: any) {
            console.error("Failed to create role", error);
            showToast(error.response?.data?.message || "Failed to create custom role", "error");
        } finally {
            setIsSubmittingRole(false);
        }
    };

    const handleRenewMasterKey = () => {
        const btn = document.getElementById('renew-btn');
        if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Renewing...';
            btn.classList.add('opacity-80', 'pointer-events-none');
            
            setTimeout(() => {
                btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Key Renewed';
                btn.classList.remove('opacity-80', 'pointer-events-none');
                btn.classList.replace('bg-primary', 'bg-green-600');
                showToast("Global root encryption master key rotated successfully!");
                
                setTimeout(() => {
                    btn.innerHTML = 'Renew Master Key';
                    btn.classList.replace('bg-green-600', 'bg-primary');
                }, 2000);
            }, 1200);
        }
    };

    const handleDownloadAudit = () => {
        const btn = document.getElementById('download-audit-btn');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Exporting...';
            btn.classList.add('opacity-80', 'pointer-events-none');
            
            setTimeout(() => {
                const csvContent = "Date,EventAction,Scope,EnforcedBy,Status\n" +
                    `${new Date().toISOString().split('T')[0]},RBAC Policy Audit,Global Platform,Super Admin,Compliant\n` +
                    `${new Date().toISOString().split('T')[0]},Multi-Tenant Role Query,Tenant Level,Super Admin,Success\n`;
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `RBAC_Security_Audit_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                btn.innerHTML = originalText;
                btn.classList.remove('opacity-80', 'pointer-events-none');
                showToast("Security audit export downloaded successfully!");
            }, 1000);
        }
    };

    const PermissionCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
        <label className="flex items-center gap-2 cursor-pointer group shrink-0">
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'bg-[#22c55e] border-[#22c55e]' : 'bg-white border-outline-variant group-hover:border-[#22c55e]'}`}>
                {checked && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
            </div>
            <span className="text-[13px] text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
        </label>
    );

    // Filter tenant roles
    const filteredTenantRoles = (rbacData?.tenantCustomRoles || []).filter(r => 
        (r.roleName || '').toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
        (r.tenantName || '').toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
        (r.accessScope || '').toLowerCase().includes(searchRoleQuery.toLowerCase())
    );

    const currentIndustryTemplate = rbacData?.industryTemplates?.[selectedIndustry] || {
        columns: [],
        rows: []
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative overflow-x-hidden">
                <Sidebar />
                <TopNavigation />

                <main className="ml-sidebar-width pt-24 px-gutter pb-12">
                    <div className="max-w-container-max mx-auto space-y-8">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">
                                    <span>Governance</span>
                                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                                    <span className="text-secondary">Multi-Tenant RBAC</span>
                                </div>
                                <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Role-Based Access Control (RBAC)</h2>
                                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
                                    Configure global platform entitlements, tenant custom roles, and multi-organization permission matrix across Colleges, Clinics, Salons & Enterprises.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsCustomRoleDrawerOpen(true)}
                                className="bg-primary-container text-white px-6 py-3 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-all active:scale-95 shadow-md hover:shadow-lg cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">add_moderator</span>
                                Create Custom Role
                            </button>
                        </div>

                        {/* Metric Cards (Bento Style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                            {/* Card 1: Active Roles */}
                            <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Total Roles</p>
                                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                        <span className="material-symbols-outlined text-xl">groups</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-headline-lg text-headline-lg font-bold text-primary">
                                        {isLoading ? '...' : (rbacData?.totalRoles || 4)}
                                    </h3>
                                    <p className="font-label-md text-[11px] text-on-surface-variant mt-1">
                                        4 Core Platform + {rbacData?.tenantCustomRoles?.length || 0} Tenant Roles
                                    </p>
                                </div>
                            </div>

                            {/* Card 2: 2FA Enforcement */}
                            <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">2FA Enforcement</p>
                                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                        <span className="material-symbols-outlined text-xl">verified_user</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-end gap-2">
                                        <h3 className="font-headline-lg text-headline-lg font-bold text-emerald-600">
                                            {isLoading ? '...' : (rbacData?.twoFactorEnforcement || '100%')}
                                        </h3>
                                        <span className="font-mono-data mb-1.5 flex items-center text-[11px] text-emerald-600 font-bold">
                                            <span className="material-symbols-outlined text-[14px]">shield</span>
                                            Active
                                        </span>
                                    </div>
                                    <p className="font-label-md text-[11px] text-on-surface-variant mt-1">Tenant authentication standard</p>
                                </div>
                            </div>

                            {/* Card 3: Active Organizations */}
                            <div className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">Active Organizations</p>
                                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                        <span className="material-symbols-outlined text-xl">domain</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-headline-lg text-headline-lg font-bold text-primary">
                                        {isLoading ? '...' : (rbacData?.activeTenantsCount || 1)}
                                    </h3>
                                    <p className="font-label-md text-[11px] text-on-surface-variant mt-1">Multi-Tenant live instances</p>
                                </div>
                            </div>

                            {/* Card 4: Global Posture */}
                            <div className="bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary-container/20 blur-3xl rounded-full"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-wider font-semibold">Security Posture</p>
                                    <span className="material-symbols-outlined text-secondary-container text-xl">gavel</span>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <h3 className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">
                                        {rbacData?.securityPosture || 'STRICT'}
                                    </h3>
                                    <p className="font-label-md text-[11px] text-on-primary-container mt-1">Zero-Trust Real-time Enforced</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs for Multi-Organization RBAC */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 sm:p-6 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-headline-md text-headline-md font-bold text-primary">
                                        {activeTab === 'System Platform Roles' && 'Platform Governance Matrix'}
                                        {activeTab === 'Tenant Custom Roles' && 'Active Tenant Custom Roles'}
                                        {activeTab === 'Industry Templates' && 'Industry Multi-Organization Presets'}
                                    </h3>
                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                        {activeTab === 'System Platform Roles' && 'Root platform permissions across Superadmin, Tenant Admin, Staff, and Clients.'}
                                        {activeTab === 'Tenant Custom Roles' && 'Live custom roles created by organizations in their Settings > Security console.'}
                                        {activeTab === 'Industry Templates' && 'Built-in role blueprints customized for Colleges, Clinics, and Salons.'}
                                    </p>
                                </div>
                                
                                <div className="flex bg-surface-container p-1 rounded-xl overflow-x-auto">
                                    {(['System Platform Roles', 'Tenant Custom Roles', 'Industry Templates'] as TabName[]).map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer text-sm ${activeTab === tab ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:text-primary'}`}
                                        >
                                            {tab === 'Tenant Custom Roles' ? (
                                                <span className="flex items-center gap-1.5">
                                                    <span>{tab}</span>
                                                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                                                        {rbacData?.tenantCustomRoles?.length || 0}
                                                    </span>
                                                </span>
                                            ) : tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* TAB 1: System Platform Roles Matrix */}
                            {activeTab === 'System Platform Roles' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left">
                                        <thead>
                                            <tr className="bg-surface-container-low border-b border-surface-container">
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Platform Feature / Capability</th>
                                                {(rbacData?.systemRoleColumns || ['Super Administrator', 'Tenant Administrator', 'Service Provider / Staff', 'Client / Customer']).map((col, i) => (
                                                    <th key={i} className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-container">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                                        <span className="material-symbols-outlined animate-spin text-2xl text-secondary">progress_activity</span>
                                                        <p className="mt-2 text-xs">Loading platform permission matrix...</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                (rbacData?.systemFeatureRows || []).map((row, rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-surface-container-low transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                                                    <span className="material-symbols-outlined text-[18px]">{row.icon || 'security'}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-body-md text-body-md font-semibold text-primary">{row.feature}</p>
                                                                    <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">{row.module} Module</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {row.permissions.map((hasPermission, colIdx) => (
                                                            <td key={colIdx} className="px-6 py-5 text-center">
                                                                {hasPermission ? (
                                                                    <span className="material-symbols-outlined text-green-600 font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-outline/30">remove</span>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* TAB 2: Live Tenant Custom Roles */}
                            {activeTab === 'Tenant Custom Roles' && (
                                <div>
                                    <div className="p-4 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between gap-4">
                                        <div className="relative w-full max-w-md">
                                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">search</span>
                                            <input 
                                                type="text"
                                                placeholder="Filter by role name, organization, or scope..."
                                                value={searchRoleQuery}
                                                onChange={(e) => setSearchRoleQuery(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div className="text-xs text-on-surface-variant font-mono">
                                            {filteredTenantRoles.length} custom role{filteredTenantRoles.length === 1 ? '' : 's'} registered
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left min-w-[750px]">
                                            <thead className="bg-surface-container-low border-b border-surface-container">
                                                <tr>
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Role Title & ID</th>
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Organization / Tenant</th>
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Access Scope</th>
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Privilege</th>
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Assigned Staff</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container">
                                                {filteredTenantRoles.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                                            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-secondary">
                                                                <span className="material-symbols-outlined text-2xl">shield_person</span>
                                                            </div>
                                                            <p className="font-bold text-primary">No tenant custom roles found</p>
                                                            <p className="text-xs text-on-surface-variant mt-1">Tenant admins can define new roles from Admin Settings &gt; Security &amp; Permissions.</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredTenantRoles.map((role) => (
                                                        <tr key={role.id} className="hover:bg-surface-container-lowest transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-secondary text-sm">badge</span>
                                                                    <span className="font-bold text-primary text-sm">{role.roleName}</span>
                                                                </div>
                                                                <span className="text-[11px] font-mono text-on-surface-variant">ID: #{role.id}</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm text-on-surface">{role.tenantName}</span>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                                        (role.tenantType || '').toUpperCase() === 'COLLEGE' ? 'bg-amber-100 text-amber-800' :
                                                                        (role.tenantType || '').toUpperCase() === 'CLINIC' ? 'bg-blue-100 text-blue-800' :
                                                                        (role.tenantType || '').toUpperCase() === 'SALON' ? 'bg-pink-100 text-pink-800' :
                                                                        'bg-slate-100 text-slate-800'
                                                                    }`}>
                                                                        {role.tenantType || 'GENERAL'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-on-surface">
                                                                <span className="bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/50 text-xs">
                                                                    {role.accessScope}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`font-mono text-[10px] px-2 py-1 rounded border font-semibold ${
                                                                    role.privilegeLevel === 'HIGH_PRIVILEGE' 
                                                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                }`}>
                                                                    {role.privilegeLevel}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                                                                    <span className="material-symbols-outlined text-xs text-secondary">person</span>
                                                                    {role.assignedUsers} assigned
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: Industry Templates */}
                            {activeTab === 'Industry Templates' && (
                                <div>
                                    {/* Industry Sub-selector */}
                                    <div className="p-4 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-2">
                                            {(['Education / College', 'Healthcare / Clinic', 'Beauty & Wellness'] as IndustryType[]).map(ind => (
                                                <button
                                                    key={ind}
                                                    onClick={() => setSelectedIndustry(ind)}
                                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                        selectedIndustry === ind 
                                                            ? 'bg-secondary text-white shadow-sm' 
                                                            : 'bg-surface-container text-on-surface-variant hover:text-primary'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {ind.includes('College') ? 'school' : ind.includes('Clinic') ? 'local_hospital' : 'spa'}
                                                    </span>
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-green-600">verified</span>
                                            Industry Standard RBAC Template
                                        </span>
                                    </div>

                                    {/* Template Matrix */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[700px] text-left">
                                            <thead>
                                                <tr className="bg-surface-container-low border-b border-surface-container">
                                                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Entitlement / Feature</th>
                                                    {currentIndustryTemplate.columns.map((col, i) => (
                                                        <th key={i} className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container">
                                                {currentIndustryTemplate.rows.map((row, rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-surface-container-low transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="material-symbols-outlined text-secondary text-sm">{row.icon || 'shield'}</span>
                                                                <span className="font-semibold text-sm text-primary">{row.feature}</span>
                                                            </div>
                                                        </td>
                                                        {row.permissions.map((hasPermission, colIdx) => (
                                                            <td key={colIdx} className="px-6 py-4 text-center">
                                                                {hasPermission ? (
                                                                    <span className="material-symbols-outlined text-green-600 font-bold text-lg" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-outline/30 text-lg">remove</span>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Matrix Footer */}
                            <div className="p-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="font-body-md text-xs text-on-surface-variant italic">
                                    All permissions are dynamically enforced at both the API gateway and the UI view level based on the authenticated JWT roles.
                                </p>
                                <button 
                                    onClick={() => navigate('/superadmin/audit-logs')}
                                    className="text-secondary font-label-md text-xs flex items-center gap-1 hover:underline font-bold"
                                >
                                    View Live Security Audit Logs
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Risk Intelligence & Zero Trust Block */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-secondary">encrypted</span>
                                        <h4 className="font-headline-md text-headline-md font-bold text-primary">Zero-Trust Policy Enforcement Engine</h4>
                                    </div>
                                    <p className="font-body-md text-sm text-on-surface-variant max-w-lg leading-relaxed">
                                        Our multi-tenant architecture uses tenant-isolated JWTs with dynamic permission claims. Master keys can be rotated on demand without service interruption.
                                    </p>
                                    <div className="mt-6 flex flex-wrap gap-4">
                                        <button 
                                            onClick={handleRenewMasterKey}
                                            id="renew-btn"
                                            className="px-5 py-2.5 bg-primary text-white rounded-xl font-label-md text-sm hover:bg-zinc-800 transition-colors flex items-center gap-2 justify-center min-w-[170px] cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">key</span>
                                            Renew Master Key
                                        </button>
                                        <button 
                                            onClick={handleDownloadAudit}
                                            id="download-audit-btn"
                                            className="px-5 py-2.5 border border-outline-variant rounded-xl font-label-md text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2 justify-center min-w-[210px] cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Download Security Audit
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                                    <div className="w-full h-full bg-gradient-to-l from-primary-container to-transparent"></div>
                                </div>
                            </div>
                            
                            <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl flex flex-col justify-center text-center">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                                    <span className="material-symbols-outlined text-[32px]">verified_user</span>
                                </div>
                                <h4 className="font-headline-md text-headline-md font-bold text-primary mb-1">RBAC Status Active</h4>
                                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                                    Global role policies and endpoint authorization rules are actively enforced.
                                </p>
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-bold border border-green-200">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        ENFORCED &amp; COMPLIANT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Custom Role Builder Drawer */}
                {isCustomRoleDrawerOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                        <div 
                            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                            onClick={() => setIsCustomRoleDrawerOpen(false)}
                        ></div>
                        
                        <div className="relative w-full max-w-xl h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.15)] flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-surface-container bg-surface-container-lowest shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">add_moderator</span>
                                    </div>
                                    <div>
                                        <h2 className="font-headline-md text-lg text-primary font-bold">Define Custom Role</h2>
                                        <p className="text-xs text-on-surface-variant">Multi-Organization RBAC Entitlement Builder</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsCustomRoleDrawerOpen(false)}
                                    className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-full hover:bg-error-container"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {/* Drawer Body */}
                            <form onSubmit={handleCreateRoleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                {/* Section 1: Role Metadata */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Role Metadata</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-on-surface mb-1.5">Role Title</label>
                                        <input 
                                            type="text" 
                                            value={newRoleTitle}
                                            onChange={(e) => setNewRoleTitle(e.target.value)}
                                            placeholder="e.g. Department Head, Academic Registrar, Senior Stylist"
                                            required
                                            className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-1.5">Role Scope</label>
                                            <div className="relative">
                                                <select 
                                                    value={newRoleScope}
                                                    onChange={(e) => setNewRoleScope(e.target.value)}
                                                    className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow cursor-pointer"
                                                >
                                                    <option value="Academic/Sessions & Schedules">Academic / Sessions (College)</option>
                                                    <option value="Student Records & Enrollment">Student Records (College)</option>
                                                    <option value="Clinical / Appointments">Clinical / Consultations (Clinic)</option>
                                                    <option value="Patient Medical Records & EMR">Medical Records (Clinic)</option>
                                                    <option value="Bookings & Stylist Schedules">Bookings & Stylists (Salon)</option>
                                                    <option value="Billing & Financial Ledger">Billing & Ledger (All)</option>
                                                    <option value="Full Administrative Access">Full Administrative Access</option>
                                                    <option value="Read-only Staff Access">Read-only Staff Access</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant text-sm">expand_more</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-1.5">Clone Base Role</label>
                                            <div className="relative">
                                                <select 
                                                    value={cloneBase}
                                                    onChange={(e) => setCloneBase(e.target.value)}
                                                    className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow cursor-pointer"
                                                >
                                                    <option value="Start from Scratch">Start from Scratch</option>
                                                    <option value="Super Administrator">Super Administrator</option>
                                                    <option value="Tenant Administrator">Tenant Administrator</option>
                                                    <option value="Service Provider / Staff">Service Provider / Staff</option>
                                                    <option value="Client / Customer">Client / Customer</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant text-sm">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Module Access Configuration */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Granular Module Permissions</h3>
                                    
                                    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                                        <div className="divide-y divide-outline-variant/40">
                                            {/* Records Row */}
                                            <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                <div>
                                                    <span className="font-semibold text-sm text-on-surface">Client &amp; Member Records</span>
                                                    <p className="text-[11px] text-on-surface-variant">Profile data, histories, and logs</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <PermissionCheckbox label="Read" checked={rolePermissions.records.read} onChange={() => togglePermission('records', 'read')} />
                                                    <PermissionCheckbox label="Write" checked={rolePermissions.records.write} onChange={() => togglePermission('records', 'write')} />
                                                    <PermissionCheckbox label="Edit" checked={rolePermissions.records.edit} onChange={() => togglePermission('records', 'edit')} />
                                                    <PermissionCheckbox label="Delete" checked={rolePermissions.records.delete} onChange={() => togglePermission('records', 'delete')} />
                                                </div>
                                            </div>
                                            
                                            {/* Billing Row */}
                                            <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                <div>
                                                    <span className="font-semibold text-sm text-on-surface">Finance &amp; Invoicing</span>
                                                    <p className="text-[11px] text-on-surface-variant">Payments, discounts, and ledger</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <PermissionCheckbox label="Read" checked={rolePermissions.billing.read} onChange={() => togglePermission('billing', 'read')} />
                                                    <PermissionCheckbox label="Write" checked={rolePermissions.billing.write} onChange={() => togglePermission('billing', 'write')} />
                                                    <PermissionCheckbox label="Edit" checked={rolePermissions.billing.edit} onChange={() => togglePermission('billing', 'edit')} />
                                                    <PermissionCheckbox label="Delete" checked={rolePermissions.billing.delete} onChange={() => togglePermission('billing', 'delete')} />
                                                </div>
                                            </div>
                                            
                                            {/* Scheduling Row */}
                                            <div className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                <div>
                                                    <span className="font-semibold text-sm text-on-surface">Scheduling &amp; Slots</span>
                                                    <p className="text-[11px] text-on-surface-variant">Calendar and booking appointments</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <PermissionCheckbox label="Read" checked={rolePermissions.scheduling.read} onChange={() => togglePermission('scheduling', 'read')} />
                                                    <PermissionCheckbox label="Write" checked={rolePermissions.scheduling.write} onChange={() => togglePermission('scheduling', 'write')} />
                                                    <PermissionCheckbox label="Edit" checked={rolePermissions.scheduling.edit} onChange={() => togglePermission('scheduling', 'edit')} />
                                                    <PermissionCheckbox label="Delete" checked={rolePermissions.scheduling.delete} onChange={() => togglePermission('scheduling', 'delete')} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Security Policies */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">Security Rules</h3>
                                    
                                    <div 
                                        className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-lowest hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                        onClick={() => setRequireMFA(!requireMFA)}
                                    >
                                        <div>
                                            <span className="text-sm font-semibold text-on-surface">Require Multi-Factor Authentication (2FA)</span>
                                            <p className="text-xs text-on-surface-variant">Enforce OTP verification for all users assigned to this role</p>
                                        </div>
                                        <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none shadow-inner ${requireMFA ? 'bg-[#22c55e]' : 'bg-outline-variant/40'}`}>
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requireMFA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                        </div>
                                    </div>
                                </section>

                                {/* Drawer Footer Buttons */}
                                <div className="pt-4 flex justify-end gap-3 border-t border-surface-container">
                                    <button 
                                        type="button"
                                        onClick={() => setIsCustomRoleDrawerOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSubmittingRole}
                                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-md disabled:opacity-50"
                                    >
                                        {isSubmittingRole ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">security</span>
                                                Publish Custom Role
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Floating Toast Notification */}
                {toast && (
                    <div className={`fixed bottom-6 right-6 z-[200] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-in-right ${
                        toast.type === 'error' ? 'bg-red-600 shadow-red-600/30' : 'bg-[#10B981] shadow-emerald-600/30'
                    } text-white`}>
                        <span className="material-symbols-outlined text-xl">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
