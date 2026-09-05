import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

type TabName = 'System Roles' | 'Medical Staff' | 'Administrative';

const tabData = {
    'System Roles': {
        metrics: [
            { label: 'Active Roles', value: '12', subtext: 'System & Tenant Roles', icon: 'groups', style: 'default' },
            { label: '2FA Enforcement', value: '85%', subtext: 'Accounts with 2FA active', icon: 'verified_user', style: 'trend', trend: '+2.4%' },
            { label: 'API Keys', value: '42', subtext: 'Active B2B API Keys', icon: 'key', style: 'default' },
            { label: 'Global Policies', value: 'Strict', subtext: 'Current Security Posture', icon: 'gavel', style: 'primary' },
        ],
        columns: ['Clinic Admin', 'Physician', 'Front Desk', 'Billing Ops'],
        rows: [
            { feature: 'Manage Tenant Settings', icon: 'settings_applications', permissions: [true, false, false, false] },
            { feature: 'View/Edit Medical Records', icon: 'medical_information', permissions: [true, true, false, false] },
            { feature: 'Manage Appointments', icon: 'calendar_month', permissions: [true, true, true, false] },
            { feature: 'Process Patient Billing', icon: 'payments', permissions: [true, false, false, true] },
            { feature: 'View Analytical Reports', icon: 'analytics', permissions: [true, true, false, true] }
        ]
    },
    'Medical Staff': {
        metrics: [
            { label: 'Verified Licenses', value: '1,204', subtext: 'Active Medical Staff Licenses', icon: 'medical_services', style: 'default' },
            { label: 'HIPAA Audit Trail', value: '100%', subtext: 'Compliance Status', icon: 'health_and_safety', style: 'trend', trend: '+0.0%' },
            { label: 'Prescription Errors', value: '0.0%', subtext: 'e-Rx Error Rate', icon: 'prescriptions', style: 'default' },
            { label: 'EMR Sync Latency', value: '12ms', subtext: 'Real-time database sync', icon: 'speed', style: 'primary' },
        ],
        columns: ['Chief Medical Officer', 'Attending Physician', 'Resident', 'Registered Nurse'],
        rows: [
            { feature: 'Write Clinical Notes / EMR', icon: 'edit_document', permissions: [true, true, true, true] },
            { feature: 'Prescribe Medication (e-Rx)', icon: 'prescriptions', permissions: [true, true, true, false] },
            { feature: 'Access Patient Lab Results', icon: 'biotech', permissions: [true, true, true, true] },
            { feature: 'Authorize Referrals', icon: 'clinical_notes', permissions: [true, true, false, false] },
        ]
    },
    'Administrative': {
        metrics: [
            { label: 'Front Desk Logins', value: '342', subtext: 'Accounts Logged In Today', icon: 'login', style: 'default' },
            { label: 'Pending Overrides', value: '14', subtext: 'Insurance Billing Overrides', icon: 'pending_actions', style: 'trend', trend: '-3' },
            { label: 'Shift Rotations', value: '56', subtext: 'Active Calendars', icon: 'event', style: 'default' },
            { label: 'Avg Wait Time', value: '14m', subtext: 'Patient Queue Metric', icon: 'timer', style: 'primary' },
        ],
        columns: ['Clinic Director', 'Front Desk Manager', 'Medical Biller', 'Receptionist'],
        rows: [
            { feature: 'Modify Shift Rotations / Calendars', icon: 'edit_calendar', permissions: [true, true, false, false] },
            { feature: 'Override Appointment Slots', icon: 'free_cancellation', permissions: [true, true, false, false] },
            { feature: 'Process Insurance Claims (ICD-10)', icon: 'account_balance_wallet', permissions: [true, false, true, false] },
            { feature: 'Manage Refund Issuance', icon: 'price_check', permissions: [true, false, true, false] },
        ]
    }
};

export default function Permissions() {
    const [activeTab, setActiveTab] = useState<TabName>('System Roles');
    const navigate = useNavigate();
    const currentData = tabData[activeTab];

    const [isCustomRoleDrawerOpen, setIsCustomRoleDrawerOpen] = useState(false);
    const [rolePermissions, setRolePermissions] = useState({
        records: { read: true, write: false, edit: false, delete: false },
        billing: { read: true, write: true, edit: true, delete: false },
        scheduling: { read: true, write: true, edit: false, delete: false }
    });
    const [requireMFA, setRequireMFA] = useState(true);

    const togglePermission = (module: 'records' | 'billing' | 'scheduling', action: 'read' | 'write' | 'edit' | 'delete') => {
        setRolePermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: !prev[module][action]
            }
        }));
    };

    const PermissionCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
        <label className="flex items-center gap-2 cursor-pointer group shrink-0">
            <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'bg-[#22c55e] border-[#22c55e]' : 'bg-white border-outline-variant group-hover:border-[#22c55e]'}`}>
                {checked && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
            </div>
            <span className="text-[13px] text-on-surface-variant group-hover:text-on-surface transition-colors">{label}</span>
        </label>
    );

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
                                <h2 className="font-headline-lg text-headline-lg text-primary">Role-Based Access Control (RBAC)</h2>
                                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">Manage global platform roles, tenant permissions, and feature entitlements across the OmniBook ecosystem.</p>
                            </div>
                            <button 
                                onClick={() => setIsCustomRoleDrawerOpen(true)}
                                className="bg-primary-container text-white px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-all active:scale-95 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Create Custom Role
                            </button>
                        </div>

                        {/* Metric Cards (Bento Style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                            {currentData.metrics.map((metric, idx) => (
                                metric.style === 'primary' ? (
                                    <div key={idx} className="bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between shadow-lg relative overflow-hidden animate-in fade-in duration-300">
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary-container/20 blur-3xl rounded-full"></div>
                                        <div className="flex justify-between items-start relative z-10">
                                            <p className="font-label-md text-label-md text-on-primary-container">{metric.label}</p>
                                            <span className="material-symbols-outlined text-secondary-container">{metric.icon}</span>
                                        </div>
                                        <div className="mt-4 relative z-10">
                                            <h3 className="font-headline-lg text-headline-lg text-surface-container-lowest">{metric.value}</h3>
                                            <p className="font-label-md text-[11px] text-on-primary-container mt-1">{metric.subtext}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow animate-in fade-in duration-300">
                                        <div className="flex justify-between items-start">
                                            <p className="font-label-md text-label-md text-on-surface-variant">{metric.label}</p>
                                            <span className="material-symbols-outlined text-secondary-container">{metric.icon}</span>
                                        </div>
                                        <div className="mt-4">
                                            {metric.style === 'trend' ? (
                                                <div className="flex items-end gap-2">
                                                    <h3 className="font-headline-lg text-headline-lg">{metric.value}</h3>
                                                    <span className={`font-mono-data mb-1.5 flex items-center text-[11px] ${metric.trend?.startsWith('+') ? 'text-green-600' : metric.trend === '-3' ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {metric.trend !== '+0.0%' && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
                                                        {metric.trend}
                                                    </span>
                                                </div>
                                            ) : (
                                                <h3 className="font-headline-lg text-headline-lg">{metric.value}</h3>
                                            )}
                                            <p className="font-label-md text-[11px] text-on-surface-variant mt-1">{metric.subtext}</p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Global Permissions Matrix */}
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 sm:p-6 border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="font-headline-md text-headline-md">Global Permissions Matrix</h3>
                                <div className="flex bg-surface-container p-1 rounded-lg overflow-x-auto w-full sm:w-auto">
                                    {(['System Roles', 'Medical Staff', 'Administrative'] as TabName[]).map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-1.5 rounded-md text-label-md font-label-md transition-all duration-200 whitespace-nowrap cursor-pointer ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left">
                                    <thead>
                                        <tr className="bg-surface-container-low border-b border-surface-container">
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Features / Actions</th>
                                            {currentData.columns.map((col, i) => (
                                                <th key={i} className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-center animate-in fade-in">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        {currentData.rows.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-surface-container-low transition-colors group animate-in slide-in-from-top-2 duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">{row.icon}</span>
                                                        <span className="font-body-md text-body-md font-medium">{row.feature}</span>
                                                    </div>
                                                </td>
                                                {row.permissions.map((hasPermission, colIdx) => (
                                                    <td key={colIdx} className="px-6 py-5 text-center">
                                                        {hasPermission ? (
                                                            <span className="material-symbols-outlined text-green-500 font-bold" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-outline/30">remove</span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-6 border-t border-surface-container flex items-center justify-between">
                                <p className="font-body-md text-body-md text-on-surface-variant italic">Note: These are global defaults. Individual tenants can request overrides through the Support portal.</p>
                                <button 
                                    onClick={() => navigate('/superadmin/audit-logs')}
                                    className="text-secondary font-label-md text-label-md flex items-center gap-1 hover:underline"
                                >
                                    View Detailed Log
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Risk Intelligence Sidebar / Footer Block */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-headline-md text-headline-md mb-2">Policy Enforcement Engine</h4>
                                    <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">Our system uses Just-In-Time (JIT) access provisioning for root operations. Ensure that your authentication token is valid before attempting global overrides.</p>
                                    <div className="mt-6 flex gap-4">
                                        <button 
                                            onClick={() => {
                                                const btn = document.getElementById('renew-btn');
                                                if (btn) {
                                                    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Renewing...';
                                                    btn.classList.add('opacity-80', 'pointer-events-none');
                                                    
                                                    setTimeout(() => {
                                                        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check</span> Key Renewed';
                                                        btn.classList.remove('opacity-80', 'pointer-events-none');
                                                        btn.classList.replace('bg-primary', 'bg-green-600');
                                                        
                                                        setTimeout(() => {
                                                            btn.innerHTML = 'Renew Master Key';
                                                            btn.classList.replace('bg-green-600', 'bg-primary');
                                                        }, 2000);
                                                    }, 1500);
                                                }
                                            }}
                                            id="renew-btn"
                                            className="px-5 py-2.5 bg-primary text-white rounded-lg font-label-md text-label-md hover:bg-zinc-800 transition-colors flex items-center gap-2 justify-center min-w-[170px]"
                                        >
                                            Renew Master Key
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const btn = document.getElementById('download-audit-btn');
                                                if (btn) {
                                                    const originalText = btn.innerHTML;
                                                    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">sync</span> Generating...';
                                                    btn.classList.add('opacity-80', 'pointer-events-none');
                                                    
                                                    setTimeout(() => {
                                                        const csvContent = "data:text/csv;charset=utf-8,Date,Action,PerformedBy,Status\n2023-10-27,Policy Override,System Admin,Success\n2023-10-27,JIT Access Requested,Super Admin,Success\n";
                                                        const encodedUri = encodeURI(csvContent);
                                                        const link = document.createElement("a");
                                                        link.setAttribute("href", encodedUri);
                                                        link.setAttribute("download", `Security_Audit_${new Date().toISOString().split('T')[0]}.csv`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        
                                                        btn.innerHTML = originalText;
                                                        btn.classList.remove('opacity-80', 'pointer-events-none');
                                                    }, 1200);
                                                }
                                            }}
                                            id="download-audit-btn"
                                            className="px-5 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-2 justify-center min-w-[210px]"
                                        >
                                            Download Security Audit
                                        </button>
                                    </div>
                                </div>
                                {/* High-fidelity background element */}
                                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                                    <div className="w-full h-full bg-gradient-to-l from-primary-container to-transparent"></div>
                                </div>
                            </div>
                            
                            <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl flex flex-col justify-center text-center">
                                <div className="w-16 h-16 bg-red-100 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-[32px]">shield_with_heart</span>
                                </div>
                                <h4 className="font-headline-md text-headline-md mb-2">Zero Trust Status</h4>
                                <p className="font-body-md text-body-md text-on-surface-variant">Continuous verification is active for all super-admin endpoints.</p>
                                <div className="mt-6">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[12px] font-bold border border-green-200">
                                        VERIFIED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Custom Role Builder Drawer */}
                {isCustomRoleDrawerOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                        {/* Dark Background Overlay */}
                        <div 
                            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                            onClick={() => setIsCustomRoleDrawerOpen(false)}
                        ></div>
                        
                        {/* Right-Side Drawer Panel */}
                        <div className="relative w-full max-w-[45%] h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-surface-container bg-surface-container-lowest shrink-0">
                                <h2 className="font-headline-md text-[22px] text-primary font-bold">Define Custom Role</h2>
                                <button 
                                    onClick={() => setIsCustomRoleDrawerOpen(false)}
                                    className="text-on-surface-variant hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            
                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="space-y-8">
                                    
                                    {/* Section 1: Role Metadata */}
                                    <section className="space-y-5">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Role Metadata</h3>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Role Title</label>
                                            <input 
                                                type="text" 
                                                defaultValue="Clinical Auditor"
                                                className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-on-surface mb-2">Role Scope</label>
                                                <div className="relative">
                                                    <select className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow cursor-pointer">
                                                        <option>Global (System-Wide)</option>
                                                        <option selected>Tenant-Level (Medical)</option>
                                                        <option>Tenant-Level (Administrative)</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-4 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-on-surface mb-2">Clone Base Permissions</label>
                                                <div className="relative">
                                                    <select className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow cursor-pointer">
                                                        <option>Start from Scratch</option>
                                                        <option selected>Clone from: Billing Ops</option>
                                                        <option>Clone from: Physician</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-4 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
    
                                    {/* Section 2: Module Access Configuration */}
                                    <section className="space-y-5">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Granular Permission Builder</h3>
                                        
                                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
                                            <div className="bg-surface-container-low px-5 py-3 border-b border-outline-variant">
                                                <h4 className="text-sm font-bold text-on-surface">Module Access Configuration</h4>
                                            </div>
                                            
                                            <div className="divide-y divide-outline-variant/50">
                                                {/* Row 1 */}
                                                <div className="px-5 py-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                    <span className="font-semibold text-sm text-on-surface w-1/3">Patient Medical Records</span>
                                                    <div className="flex items-center gap-5 w-2/3 justify-end">
                                                        <PermissionCheckbox label="Read" checked={rolePermissions.records.read} onChange={() => togglePermission('records', 'read')} />
                                                        <PermissionCheckbox label="Write" checked={rolePermissions.records.write} onChange={() => togglePermission('records', 'write')} />
                                                        <PermissionCheckbox label="Edit" checked={rolePermissions.records.edit} onChange={() => togglePermission('records', 'edit')} />
                                                        <PermissionCheckbox label="Delete" checked={rolePermissions.records.delete} onChange={() => togglePermission('records', 'delete')} />
                                                    </div>
                                                </div>
                                                
                                                {/* Row 2 */}
                                                <div className="px-5 py-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                    <span className="font-semibold text-sm text-on-surface w-1/3">Invoicing & Billing</span>
                                                    <div className="flex items-center gap-5 w-2/3 justify-end">
                                                        <PermissionCheckbox label="Read" checked={rolePermissions.billing.read} onChange={() => togglePermission('billing', 'read')} />
                                                        <PermissionCheckbox label="Write" checked={rolePermissions.billing.write} onChange={() => togglePermission('billing', 'write')} />
                                                        <PermissionCheckbox label="Edit" checked={rolePermissions.billing.edit} onChange={() => togglePermission('billing', 'edit')} />
                                                        <PermissionCheckbox label="Delete" checked={rolePermissions.billing.delete} onChange={() => togglePermission('billing', 'delete')} />
                                                    </div>
                                                </div>
                                                
                                                {/* Row 3 */}
                                                <div className="px-5 py-4 flex items-center justify-between hover:bg-surface-container-lowest transition-colors">
                                                    <span className="font-semibold text-sm text-on-surface w-1/3">Appointment Scheduling</span>
                                                    <div className="flex items-center gap-5 w-2/3 justify-end">
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
                                    <section className="space-y-5">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Security Policies</h3>
                                        
                                        <div 
                                            className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                            onClick={() => setRequireMFA(!requireMFA)}
                                        >
                                            <span className="text-sm font-semibold text-on-surface">Require MFA/2FA for this role</span>
                                            <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none shadow-inner ${requireMFA ? 'bg-[#22c55e]' : 'bg-outline-variant/30'}`}>
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requireMFA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                            </div>
                                        </div>
                                    </section>
    
                                </div>
                            </div>
                            
                            {/* Drawer Footer */}
                            <div className="px-8 py-5 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-4 shrink-0">
                                <button 
                                    onClick={() => setIsCustomRoleDrawerOpen(false)}
                                    className="px-6 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsCustomRoleDrawerOpen(false);
                                        alert('Custom Role "Clinical Auditor" has been successfully created and published.');
                                    }}
                                    className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                                >
                                    <span className="material-symbols-outlined text-[18px]">security</span>
                                    Publish Custom Role
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
