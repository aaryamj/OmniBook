import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useOrganizationTerms } from '../../../utils/organizationTerms';

export default function ProviderSidebar() {
    const terms = useOrganizationTerms();
    const navigate = useNavigate();

    const [currentRoleName, setCurrentRoleName] = React.useState<string | null>(() => localStorage.getItem('tenantRoleName'));
    const [rawPermissions, setRawPermissions] = React.useState<string | null>(() => localStorage.getItem('permissionsJson'));

    const syncPermissions = React.useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch('http://localhost:8080/api/v1/tenant/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.tenantRoleName !== undefined) {
                    setCurrentRoleName(data.tenantRoleName);
                    if (data.tenantRoleName) {
                        localStorage.setItem('tenantRoleName', data.tenantRoleName);
                    } else {
                        localStorage.removeItem('tenantRoleName');
                    }
                }
                if (data.permissionsJson !== undefined) {
                    setRawPermissions(data.permissionsJson);
                    if (data.permissionsJson) {
                        localStorage.setItem('permissionsJson', data.permissionsJson);
                    } else {
                        localStorage.removeItem('permissionsJson');
                    }
                }
            }
        } catch (e) {
            console.debug("ProviderSidebar permission sync failed", e);
        }
    }, []);

    React.useEffect(() => {
        syncPermissions();
        const handleFocus = () => syncPermissions();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [syncPermissions]);

    // Parse role-based feature permissions
    const permissions = React.useMemo(() => {
        const isCustomRole = !!currentRoleName;
        // Full access default only for primary owners without custom role restrictions
        const defaults = {
            calendar: { read: true, write: true },
            patients: { read: !isCustomRole, write: !isCustomRole },
            services: { read: !isCustomRole, write: !isCustomRole },
            analytics: { read: !isCustomRole, write: !isCustomRole }
        };
        if (!rawPermissions) return defaults;
        try {
            const parsed = JSON.parse(rawPermissions);
            return {
                calendar: { read: parsed.calendar?.read === true, write: parsed.calendar?.write === true },
                patients: { read: parsed.patients?.read === true, write: parsed.patients?.write === true },
                services: { read: parsed.services?.read === true, write: parsed.services?.write === true },
                analytics: { read: parsed.analytics?.read === true, write: parsed.analytics?.write === true }
            };
        } catch (e) {
            console.error("Failed to parse permissionsJson in ProviderSidebar", e);
            return defaults;
        }
    }, [rawPermissions, currentRoleName]);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('fullName');
        localStorage.removeItem('tenantRoleName');
        localStorage.removeItem('permissionsJson');
        localStorage.removeItem('accessScope');
        localStorage.removeItem('privilegeLevel');
        navigate('/login');
    };

    return (
        <nav className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-surface-container-low border-r border-outline-variant py-6 px-4 flex flex-col gap-2 z-40 hidden md:flex">
            <div className="mb-4 px-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            dashboard
                        </span>
                    </div>
                    <div className="overflow-hidden">
                        <span className="text-[16px] text-primary font-bold block truncate leading-tight">{terms.providerSingular} Portal</span>
                        {currentRoleName ? (
                            <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wider truncate max-w-[140px]">
                                {currentRoleName}
                            </span>
                        ) : (
                            <span className="text-[11px] text-on-surface-variant">Active Provider</span>
                        )}
                    </div>
                </div>
            </div>

            <NavLink 
                to="/provider-dashboard" 
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
            </NavLink>

            {permissions.calendar.read && (
                <NavLink 
                    to="/master-calendar" 
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Master Calendar
                </NavLink>
            )}

            {permissions.patients.read && (
                <NavLink 
                    to="/patients" 
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">{terms.customersNavIcon}</span>
                    {terms.customersNavLabel}
                </NavLink>
            )}

            {permissions.services.read && (
                <NavLink 
                    to="/services" 
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">{terms.servicesNavIcon}</span>
                    {terms.servicesNavLabel}
                </NavLink>
            )}

            {permissions.analytics.read && (
                <NavLink 
                    to="/analytics" 
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    Revenue & Analytics
                </NavLink>
            )}

            <NavLink 
                to="/provider/settlements" 
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Daily Settlements
            </NavLink>

            <div className="mt-auto flex flex-col gap-1">
                <NavLink 
                    to="/provider/settings" 
                    className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all ${isActive ? 'text-primary bg-primary/10 font-bold' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Settings
                </NavLink>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all text-[#ba1a1a] hover:bg-[#ffdad6]/20 text-left cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Log Out
                </button>
            </div>
        </nav>
    );
}
