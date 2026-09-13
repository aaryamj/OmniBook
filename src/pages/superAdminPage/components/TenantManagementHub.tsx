import React, { useState, useRef, useEffect } from 'react';

import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Tenant {
    id: number;
    organizationName: string;
    registrationNumber: string;
    adminEmail: string;
    status: string;
    kycVerified: boolean;
    subscriptionTier: string;
    logoUrl?: string;
    primaryAccentColor?: string;
    phoneContact?: string;
    timezone?: string;
    openingTime?: string;
    closingTime?: string;
    slotDuration?: number;
    legalBusinessName?: string;
    businessEntityType?: string;
    ibanAccountNumber?: string;
    medicalLicenseUrl?: string;
    address?: string;
}

export default function TenantManagementHub({ timeFilter }: { timeFilter?: string }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [filter, setFilter] = useState('All');
    const [searchFilter, setSearchFilter] = useState(() => searchParams.get('search') || '');
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);

    // Suspension / Reactivation states
    const [suspendTenantId, setSuspendTenantId] = useState<number | null>(null);
    const [reactivateTenantId, setReactivateTenantId] = useState<number | null>(null);
    const [actionConfirmText, setActionConfirmText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const s = searchParams.get('search');
        if (s !== null) {
            setSearchFilter(s);
        }
    }, [searchParams]);

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = timeFilter
                ? `http://localhost:8080/api/v1/superadmin/tenants?timeFilter=${encodeURIComponent(timeFilter)}`
                : 'http://localhost:8080/api/v1/superadmin/tenants';
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTenants(res.data);
        } catch (error: any) {
            console.error("Failed to fetch tenants", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchTenants();
    }, [timeFilter]);

    const handleApprove = async (tenantId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/superadmin/tenants/${tenantId}/approve`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTenants(); // refresh the list
            setOpenActionId(null);
        } catch (error) {
            console.error("Failed to approve tenant", error);
            alert("Failed to approve tenant.");
        }
    };

    const handleSuspend = async () => {
        if (!suspendTenantId) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/superadmin/tenants/${suspendTenantId}/suspend`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTenants();
            setSuspendTenantId(null);
            setActionConfirmText('');
        } catch (error) {
            console.error("Failed to suspend tenant", error);
            alert("Failed to suspend tenant.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReactivate = async () => {
        if (!reactivateTenantId) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/superadmin/tenants/${reactivateTenantId}/reactivate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTenants();
            setReactivateTenantId(null);
            setActionConfirmText('');
        } catch (error) {
            console.error("Failed to reactivate tenant", error);
            alert("Failed to reactivate tenant.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter Logic
    const filteredTenants = tenants.filter(t => {
        let statusMatch = true;
        if (filter === 'Active') statusMatch = t.status === 'ACTIVE';
        if (filter === 'Pending') statusMatch = t.status === 'PENDING_VERIFICATION' || t.status === 'PENDING_SETUP' || t.status === 'PENDING';
        if (filter === 'Suspended') statusMatch = t.status === 'SUSPENDED';

        let searchMatch = true;
        if (searchFilter.trim() !== '') {
            const q = searchFilter.trim().toLowerCase();
            searchMatch = (t.organizationName && t.organizationName.toLowerCase().includes(q)) ||
                          (t.adminEmail && t.adminEmail.toLowerCase().includes(q)) ||
                          (t.registrationNumber && t.registrationNumber.toLowerCase().includes(q)) ||
                          (t.subscriptionTier && t.subscriptionTier.toLowerCase().includes(q)) ||
                          (t.address && t.address.toLowerCase().includes(q)) ||
                          (t.phoneContact && t.phoneContact.toLowerCase().includes(q)) ||
                          String(t.id).includes(q);
        }

        return statusMatch && searchMatch;
    });

    // --- Pagination State & Dynamic Calculations ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset pagination to page 1 whenever any filter, search or pageSize changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchFilter, filter, pageSize, timeFilter]);

    const totalEntries = filteredTenants.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        let start = Math.max(1, safeCurrentPage - 2);
        let end = Math.min(totalPages, start + 4);
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Close action menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setOpenActionId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleActionMenu = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenActionId(openActionId === id ? null : id);
    };

    const getFilterClass = (btnFilter: string) => {
        if (filter === btnFilter) {
            return "px-3 py-1 bg-surface-container-lowest shadow-sm rounded text-label-md font-label-md transition-all";
        }
        return "px-3 py-1 text-on-surface-variant text-label-md font-label-md hover:bg-surface-container-lowest transition-all rounded";
    };

    return (
        <section className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-surface-container flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-surface-bright">
                <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                        Tenant Management Hub
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                        {filteredTenants.length} of {tenants.length} {tenants.length === 1 ? 'tenant' : 'tenants'}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search Filter Input */}
                    <div className="relative w-full sm:w-72 md:w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search name, email, PAN, plan, ID..."
                            value={searchFilter}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchFilter(val);
                                const next = new URLSearchParams(searchParams);
                                if (val.trim()) {
                                    next.set('search', val);
                                } else {
                                    next.delete('search');
                                }
                                setSearchParams(next, { replace: true });
                            }}
                            className="w-full pl-9 pr-8 py-1.5 text-xs bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                        />
                        {searchFilter && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchFilter('');
                                    const next = new URLSearchParams(searchParams);
                                    next.delete('search');
                                    setSearchParams(next, { replace: true });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                                title="Clear search"
                            >
                                <span className="material-symbols-outlined text-[15px]">close</span>
                            </button>
                        )}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex border border-outline-variant rounded-lg p-1 bg-surface-container-low shrink-0 justify-around sm:justify-start">
                        <button onClick={() => setFilter('All')} className={getFilterClass('All')}>All</button>
                        <button onClick={() => setFilter('Active')} className={getFilterClass('Active')}>Active</button>
                        <button onClick={() => setFilter('Pending')} className={getFilterClass('Pending')}>Pending</button>
                        <button onClick={() => setFilter('Suspended')} className={getFilterClass('Suspended')}>Suspended</button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full min-w-[650px] text-left border-collapse">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Organization Name & ID</th>
                            <th className="px-6 py-4 font-semibold">Admin Email</th>
                            <th className="px-6 py-4 font-semibold">Plan</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-md text-body-md relative">
                        {filteredTenants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">
                                            search_off
                                        </span>
                                        <p className="font-medium text-sm text-on-surface">No tenants found</p>
                                        <p className="text-xs text-on-surface-variant">
                                            {searchFilter 
                                                ? `No results matching "${searchFilter}" in ${filter} tab.` 
                                                : `No tenants found in ${filter} status.`}
                                        </p>
                                        {searchFilter && (
                                            <button
                                                onClick={() => {
                                                    setSearchFilter('');
                                                    const next = new URLSearchParams(searchParams);
                                                    next.delete('search');
                                                    setSearchParams(next, { replace: true });
                                                }}
                                                className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
                                            >
                                                Clear search filter
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedTenants.map((tenant) => {
                                const isPendingVerification = tenant.status === 'PENDING_VERIFICATION';
                                const isPendingSetup = tenant.status === 'PENDING_SETUP' || tenant.status === 'PENDING';
                                const isActive = tenant.status === 'ACTIVE';

                                const statusColor = isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : isPendingVerification 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : isPendingSetup
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800';

                                const statusDot = isActive 
                                    ? 'bg-green-500' 
                                    : isPendingVerification 
                                    ? 'bg-amber-500' 
                                    : isPendingSetup
                                    ? 'bg-blue-500'
                                    : 'bg-red-500';

                                const displayStatus = isActive 
                                    ? 'Active' 
                                    : isPendingVerification 
                                    ? 'Awaiting Approval' 
                                    : isPendingSetup 
                                    ? 'Pending Setup' 
                                    : 'Suspended';
                                const initials = tenant.organizationName.substring(0, 2).toUpperCase();

                                return (
                                    <tr key={tenant.id} className="hover:bg-surface-bright transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 transform group-hover:translate-x-1 transition-transform">
                                                {tenant.logoUrl ? (
                                                    <img src={tenant.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover border border-surface-container bg-surface-container-lowest" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold font-mono-data bg-secondary-fixed text-secondary">
                                                        {initials}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-primary">{tenant.organizationName}</p>
                                                    <p className="text-[11px] font-mono-data text-on-surface-variant">ID: {tenant.id} | Reg: {tenant.registrationNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-on-surface-variant">{tenant.adminEmail}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${tenant.subscriptionTier === 'Starter' ? 'bg-green-100 text-green-800' : tenant.subscriptionTier === 'Professional' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {tenant.subscriptionTier || 'Enterprise'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${statusColor}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span> {displayStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => toggleActionMenu(tenant.id, e)}
                                                className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-all active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                            </button>

                                            {/* Action Dropdown Menu */}
                                            {openActionId === tenant.id && (
                                                <div
                                                    ref={actionMenuRef}
                                                    className="absolute right-6 top-10 w-48 bg-surface-container-lowest border border-surface-container rounded-xl shadow-lg z-50 overflow-hidden text-left"
                                                >
                                                    <ul className="py-1">
                                                        {(isPendingVerification || isPendingSetup || (!tenant.kycVerified && tenant.status !== 'ACTIVE' && tenant.status !== 'SUSPENDED')) && (
                                                            <li onClick={() => handleApprove(tenant.id)} className="px-4 py-2 hover:bg-green-50 cursor-pointer flex items-center gap-2 text-green-700 text-sm font-bold transition-colors">
                                                                <span className="material-symbols-outlined text-[16px]">verified</span> Approve Tenant
                                                            </li>
                                                        )}
                                                        <li onClick={() => { setSelectedTenant(tenant); setOpenActionId(null); }} className="px-4 py-2 hover:bg-surface-container-low cursor-pointer flex items-center gap-2 text-on-surface text-sm transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                                                        </li>
                                                        <div className="border-t border-surface-container my-1"></div>

                                                        {tenant.status === 'SUSPENDED' ? (
                                                            <li onClick={() => { setReactivateTenantId(tenant.id); setOpenActionId(null); }} className="px-4 py-2 hover:bg-green-50 hover:text-green-700 cursor-pointer flex items-center gap-2 text-on-surface text-sm transition-colors">
                                                                <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span> Reactivate Account
                                                            </li>
                                                        ) : (
                                                            <li onClick={() => { setSuspendTenantId(tenant.id); setOpenActionId(null); }} className="px-4 py-2 hover:bg-error-container/20 hover:text-error cursor-pointer flex items-center gap-2 text-error text-sm transition-colors">
                                                                <span className="material-symbols-outlined text-[16px]">block</span> Suspend Account
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Dynamic Pagination Bar matching CRM */}
            <div className="p-4 border-t border-surface-container bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-xs text-on-surface-variant font-mono-data">
                        Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0} - {endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> tenants
                        {totalEntries !== tenants.length && (
                            <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                (filtered from {tenants.length} total)
                            </span>
                        )}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <span>Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="bg-surface py-1 px-2 rounded border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button 
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                        aria-label="Previous Page"
                    >
                        <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map(page => (
                            <button 
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                                    safeCurrentPage === page
                                        ? 'bg-primary text-on-primary shadow-sm shadow-primary/30'
                                        : 'border border-outline-variant/40 hover:bg-surface-container text-on-surface-variant hover:text-primary hover:border-primary/40'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button 
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages || totalEntries === 0}
                        className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                        aria-label="Next Page"
                    >
                        Next
                        <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* View Details Modal */}
            {selectedTenant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-surface-container flex items-center justify-between" style={{ borderBottomColor: selectedTenant.primaryAccentColor || '' }}>
                            <div className="flex items-center gap-4">
                                {selectedTenant.logoUrl ? (
                                    <img src={selectedTenant.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-contain border border-surface-container bg-surface-container-lowest" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl font-mono-data bg-secondary-fixed text-secondary">
                                        {selectedTenant.organizationName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-bold text-on-surface">{selectedTenant.organizationName}</h2>
                                    <p className="text-sm text-on-surface-variant font-mono">ID: {selectedTenant.id} | Registration: {selectedTenant.registrationNumber}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTenant(null)} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-surface-container-lowest">

                            {/* Profile & Settings */}
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-surface-container pb-2">
                                    <span className="material-symbols-outlined">person</span> Profile & Settings
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Admin Email</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.adminEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phone Contact</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.phoneContact || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Timezone</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.timezone || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Address / Location</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.address || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Business Hours</p>
                                        <p className="text-sm text-on-surface">
                                            {selectedTenant.openingTime && selectedTenant.closingTime
                                                ? `${selectedTenant.openingTime} - ${selectedTenant.closingTime} (${selectedTenant.slotDuration}m slots)`
                                                : <span className="italic opacity-50">Not provided</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Subscription Tier</p>
                                        <span className={`px-2 py-1 inline-block rounded text-[11px] font-bold uppercase ${selectedTenant.subscriptionTier === 'Starter' ? 'bg-green-100 text-green-800' : selectedTenant.subscriptionTier === 'Professional' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {selectedTenant.subscriptionTier || 'Enterprise'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                            selectedTenant.status === 'ACTIVE' 
                                                ? 'bg-green-100 text-green-800' 
                                                : selectedTenant.status === 'PENDING_VERIFICATION' 
                                                ? 'bg-amber-100 text-amber-800' 
                                                : (selectedTenant.status === 'PENDING_SETUP' || selectedTenant.status === 'PENDING')
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                selectedTenant.status === 'ACTIVE' 
                                                    ? 'bg-green-500' 
                                                    : selectedTenant.status === 'PENDING_VERIFICATION' 
                                                    ? 'bg-amber-500' 
                                                    : (selectedTenant.status === 'PENDING_SETUP' || selectedTenant.status === 'PENDING')
                                                    ? 'bg-blue-500'
                                                    : 'bg-red-500'
                                            }`}></span>
                                            {selectedTenant.status === 'ACTIVE' ? 'Active' : selectedTenant.status === 'PENDING_VERIFICATION' ? 'Awaiting Approval' : (selectedTenant.status === 'PENDING_SETUP' || selectedTenant.status === 'PENDING') ? 'Pending Setup' : 'Suspended'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial & Legal */}
                            <div>
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 border-b border-surface-container pb-2">
                                    <span className="material-symbols-outlined">account_balance</span> Financial & Legal
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Legal Business Name</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.legalBusinessName || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Entity Type</p>
                                        <p className="text-sm text-on-surface">{selectedTenant.businessEntityType || <span className="italic opacity-50">Not provided</span>}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">IBAN Account Number</p>
                                        <p className="text-sm font-mono bg-surface-container-low p-2 rounded border border-outline-variant inline-block">{selectedTenant.ibanAccountNumber || <span className="italic opacity-50 font-sans">Not provided</span>}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Medical License</p>
                                        {selectedTenant.medicalLicenseUrl ? (
                                            <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-low p-2">
                                                <img src={selectedTenant.medicalLicenseUrl} alt="Medical License" className="max-w-full h-auto max-h-[400px] object-contain mx-auto rounded-lg shadow-sm" />
                                                <div className="mt-2 text-center">
                                                    <a href={selectedTenant.medicalLicenseUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-bold flex items-center justify-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span> View Full Size
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-surface-container p-6 rounded-xl border border-dashed border-outline-variant text-center">
                                                <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50 mb-2">description</span>
                                                <p className="text-sm text-on-surface-variant">No medical license uploaded.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-surface-container bg-surface flex justify-end gap-3">
                            {selectedTenant.status === 'PENDING_VERIFICATION' && (
                                <button onClick={() => { handleApprove(selectedTenant.id); setSelectedTenant(null); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">verified</span> Approve Tenant
                                </button>
                            )}
                            <button onClick={() => setSelectedTenant(null)} className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {suspendTenantId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col scale-in-95 duration-200 border border-error/20">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-error-container/30 text-error rounded-full flex items-center justify-center mx-auto mb-4 border border-error/20">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md font-black text-error mb-2">Danger Zone: Suspend Access</h3>
                            <p className="text-body-md text-on-surface-variant mb-6">
                                This will instantly suspend the tenant's access. They will no longer be able to log in or use the platform.
                                <br /><br />
                                To proceed, please type <strong className="text-on-surface select-none font-bold">{tenants.find(t => t.id === suspendTenantId)?.organizationName}</strong> below:
                            </p>

                            <input
                                type="text"
                                value={actionConfirmText}
                                onChange={(e) => setActionConfirmText(e.target.value)}
                                placeholder="Type clinic name here"
                                className="w-full bg-surface-container-lowest border border-error/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-error focus:border-transparent font-bold mb-6 text-center"
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setSuspendTenantId(null);
                                        setActionConfirmText('');
                                    }}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspend}
                                    disabled={actionConfirmText !== tenants.find(t => t.id === suspendTenantId)?.organizationName || isProcessing}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-error hover:bg-error/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex justify-center items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>Suspending...</>
                                    ) : (
                                        <>Suspend Access</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reactivate Confirmation Modal */}
            {reactivateTenantId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col scale-in-95 duration-200 border border-green-500/20">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md font-black text-green-600 mb-2">Reactivate Account</h3>
                            <p className="text-body-md text-on-surface-variant mb-6">
                                This will restore the tenant's access to the platform.
                                <br /><br />
                                To proceed, please type <strong className="text-on-surface select-none font-bold">{tenants.find(t => t.id === reactivateTenantId)?.organizationName}</strong> below:
                            </p>

                            <input
                                type="text"
                                value={actionConfirmText}
                                onChange={(e) => setActionConfirmText(e.target.value)}
                                placeholder="Type clinic name here"
                                className="w-full bg-surface-container-lowest border border-green-500/50 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-bold mb-6 text-center"
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setReactivateTenantId(null);
                                        setActionConfirmText('');
                                    }}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReactivate}
                                    disabled={actionConfirmText !== tenants.find(t => t.id === reactivateTenantId)?.organizationName || isProcessing}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex justify-center items-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>Reactivating...</>
                                    ) : (
                                        <>Reactivate Access</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
