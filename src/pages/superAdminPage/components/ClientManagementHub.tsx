import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ClientDetailModal from './ClientDetailModal';
import ClientActivitiesModal from './ClientActivitiesModal';

interface SuperadminClient {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    enabled: boolean;
    status: string;
    profilePicture?: string;
    dateOfBirth?: string;
    age?: number;
    bloodGroup?: string;
    allergies?: string;
    weight?: string;
    heartRate?: string;
    authProvider?: string;
    googleConnected?: boolean;
    facebookConnected?: boolean;
    createdAt?: string;
    lastLoginAt?: string;
    lastLoginLocation?: string;
    totalAppointments?: number;
    totalSpend?: number;
}

export default function ClientManagementHub({ timeFilter }: { timeFilter?: string }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [clients, setClients] = useState<SuperadminClient[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states: only All, Active, Suspended
    const [statusTab, setStatusTab] = useState<'All' | 'Active' | 'Suspended'>('All');
    const [searchFilter, setSearchFilter] = useState(() => searchParams.get('search') || '');
    const [dateSearch, setDateSearch] = useState('');

    // Action Dropdown & Modals state
    const [openActionId, setOpenActionId] = useState<number | null>(null);
    const [detailModalClient, setDetailModalClient] = useState<SuperadminClient | null>(null);
    const [activitiesModalClient, setActivitiesModalClient] = useState<SuperadminClient | null>(null);

    // Suspension / Reactivation state
    const [suspendClientId, setSuspendClientId] = useState<number | null>(null);
    const [reactivateClientId, setReactivateClientId] = useState<number | null>(null);
    const [actionConfirmText, setActionConfirmText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const actionMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const s = searchParams.get('search');
        if (s !== null) {
            setSearchFilter(s);
        }
    }, [searchParams]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = timeFilter
                ? `http://localhost:8080/api/v1/superadmin/clients?timeFilter=${encodeURIComponent(timeFilter)}`
                : 'http://localhost:8080/api/v1/superadmin/clients';
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setClients(res.data || []);
        } catch (error: any) {
            console.error("Failed to fetch clients", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [timeFilter]);

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

    const handleSuspend = async () => {
        if (!suspendClientId) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/superadmin/clients/${suspendClientId}/suspend`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchClients();
            setSuspendClientId(null);
            setActionConfirmText('');
        } catch (error) {
            console.error("Failed to suspend client", error);
            alert("Failed to suspend client account.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReactivate = async () => {
        if (!reactivateClientId) return;
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/superadmin/clients/${reactivateClientId}/reactivate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchClients();
            setReactivateClientId(null);
            setActionConfirmText('');
        } catch (error) {
            console.error("Failed to reactivate client", error);
            alert("Failed to reactivate client account.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Filter Logic
    const filteredClients = clients.filter(c => {
        // Status filter: All, Active, Suspended
        if (statusTab === 'Active' && !c.enabled) return false;
        if (statusTab === 'Suspended' && c.enabled) return false;

        // Date filter on registration date (YYYY-MM-DD)
        if (dateSearch) {
            if (!c.createdAt) return false;
            const regDate = c.createdAt.split('T')[0];
            if (regDate !== dateSearch) return false;
        }

        // Search filter: name, email, phone, blood group, ID
        if (searchFilter.trim() !== '') {
            const q = searchFilter.trim().toLowerCase();
            const name = (c.fullName || '').toLowerCase();
            const email = (c.email || '').toLowerCase();
            const phone = (c.phone || '').toLowerCase();
            const blood = (c.bloodGroup || '').toLowerCase();
            const id = String(c.id);

            return name.includes(q) || email.includes(q) || phone.includes(q) || blood.includes(q) || id.includes(q);
        }

        return true;
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchFilter, dateSearch, statusTab, pageSize, timeFilter]);

    const totalEntries = filteredClients.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

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

    const getTabClass = (tab: 'All' | 'Active' | 'Suspended') => {
        if (statusTab === tab) {
            return "px-3 py-1 bg-surface-container-lowest shadow-sm rounded text-label-md font-label-md transition-all font-bold text-primary";
        }
        return "px-3 py-1 text-on-surface-variant text-label-md font-label-md hover:bg-surface-container-lowest transition-all rounded";
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const targetSuspendClient = clients.find(c => c.id === suspendClientId);
    const targetReactivateClient = clients.find(c => c.id === reactivateClientId);

    return (
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden">
            {/* Header: Title & Status Segmented Tabs */}
            <div className="p-5 sm:p-6 border-b border-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-2xl">groups</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                                Client Management Hub
                            </h3>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live Sync
                            </div>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Real-time surveillance, personal records, and governance for all registered clients
                        </p>
                    </div>
                </div>

                {/* Status Segmented Control Tabs (ONLY All, Active, Suspended) */}
                <div className="flex items-center bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 shadow-xs shrink-0">
                    <button
                        type="button"
                        onClick={() => setStatusTab('All')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            statusTab === 'All'
                                ? 'bg-surface text-primary shadow-xs'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
                        }`}
                    >
                        All
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            statusTab === 'All' ? 'bg-primary/10 text-primary' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                            {clients.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab('Active')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            statusTab === 'Active'
                                ? 'bg-surface text-emerald-700 shadow-xs'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            statusTab === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                            {clients.filter(c => c.enabled).length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab('Suspended')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            statusTab === 'Suspended'
                                ? 'bg-surface text-rose-700 shadow-xs'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Suspended
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            statusTab === 'Suspended' ? 'bg-rose-50 text-rose-700' : 'bg-surface-container text-on-surface-variant'
                        }`}>
                            {clients.filter(c => !c.enabled).length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="px-5 sm:px-6 py-3 bg-surface-container-low/50 border-b border-surface-container flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Left: Search Box + Date Filter + Reset */}
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
                    {/* Keyword Search */}
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Search client name, email, phone, ID..."
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
                            className="w-full pl-9 pr-8 py-2 bg-surface rounded-xl border border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xs"
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
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error transition-colors cursor-pointer p-0.5"
                                title="Clear search"
                            >
                                <span className="material-symbols-outlined text-[15px] block">close</span>
                            </button>
                        )}
                    </div>

                    {/* Joined Date Filter */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-xl border border-outline-variant shadow-xs">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">calendar_today</span>
                        <span className="text-xs text-on-surface-variant font-medium">Joined:</span>
                        <input
                            type="date"
                            value={dateSearch}
                            onChange={(e) => setDateSearch(e.target.value)}
                            className="bg-transparent text-xs text-on-surface font-mono focus:outline-none cursor-pointer"
                        />
                        {dateSearch && (
                            <button
                                type="button"
                                onClick={() => setDateSearch('')}
                                className="text-on-surface-variant hover:text-error p-0.5 cursor-pointer ml-1"
                                title="Clear date filter"
                            >
                                <span className="material-symbols-outlined text-[14px] block">close</span>
                            </button>
                        )}
                    </div>

                    {/* Reset Active Filters */}
                    {(searchFilter || dateSearch || statusTab !== 'All') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchFilter('');
                                setDateSearch('');
                                setStatusTab('All');
                                const next = new URLSearchParams(searchParams);
                                next.delete('search');
                                setSearchParams(next, { replace: true });
                            }}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* Right: Showing Counter & Rows Selector */}
                <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="font-mono text-[11px]">
                        Showing <strong className="text-primary">{filteredClients.length}</strong> of <strong className="text-primary">{clients.length}</strong> clients
                    </span>
                    <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline text-[11px]">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="bg-surface py-1.5 px-2.5 rounded-xl border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary transition shadow-xs cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Client Profile</th>
                            <th className="px-6 py-4 font-semibold">Contact Info</th>
                            <th className="px-6 py-4 font-semibold text-center">Registered Date</th>
                            <th className="px-6 py-4 font-semibold text-center">Total Bookings</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container font-body-md text-body-md relative text-xs">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-primary block">progress_activity</span>
                                    <p className="font-semibold text-sm">Loading client directory...</p>
                                </td>
                            </tr>
                        ) : paginatedClients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40 block">search_off</span>
                                    <p className="font-medium text-sm text-on-surface">No clients found matching your filters.</p>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchFilter(''); setDateSearch(''); setStatusTab('All'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                                        Reset All Filters
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            paginatedClients.map((client) => (
                                <tr key={client.id} className="hover:bg-surface-container-low/60 transition-colors">
                                    {/* Client Profile */}
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            {client.profilePicture ? (
                                                <img 
                                                    src={client.profilePicture} 
                                                    alt={client.fullName}
                                                    className="w-10 h-10 rounded-xl object-cover bg-surface-container border border-outline-variant/60 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20 shrink-0">
                                                    {client.fullName ? client.fullName.charAt(0).toUpperCase() : 'C'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-on-surface text-sm whitespace-nowrap">{client.fullName || 'Unnamed User'}</p>
                                                <p className="text-[11px] text-on-surface-variant font-mono">ID: #{client.id}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact Info */}
                                    <td className="px-6 py-4 min-w-[220px]">
                                        <p className="font-medium text-on-surface whitespace-nowrap">{client.email || 'No email'}</p>
                                        <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">{client.phone || 'No phone'}</p>
                                    </td>

                                    {/* Registered Date */}
                                    <td className="px-6 py-4 text-center font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                                        {formatDate(client.createdAt)}
                                    </td>

                                    {/* Total Bookings */}
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className="font-bold text-primary font-mono text-sm">
                                            {client.totalAppointments ?? 0}
                                        </span>
                                    </td>

                                    {/* Account Status Badge */}
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                            client.enabled 
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                        }`}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                            {client.enabled ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>

                                    {/* Actions: 3-dot Dropdown */}
                                    <td className="px-6 py-4 text-right relative whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={(e) => toggleActionMenu(client.id, e)}
                                            className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-all active:scale-95 cursor-pointer"
                                            aria-label="Actions"
                                        >
                                            <span className="material-symbols-outlined text-[20px] block">more_vert</span>
                                        </button>

                                        {/* Action Dropdown Menu */}
                                        {openActionId === client.id && (
                                            <div
                                                ref={actionMenuRef}
                                                className="absolute right-6 top-11 w-48 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150"
                                            >
                                                <ul className="py-1 text-xs">
                                                    <li
                                                        onClick={() => {
                                                            setDetailModalClient(client);
                                                            setOpenActionId(null);
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-surface-container-low cursor-pointer flex items-center gap-2.5 text-on-surface font-semibold transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px] text-primary">visibility</span>
                                                        Details
                                                    </li>
                                                    <li
                                                        onClick={() => {
                                                            setActivitiesModalClient(client);
                                                            setOpenActionId(null);
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-surface-container-low cursor-pointer flex items-center gap-2.5 text-on-surface font-semibold transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[17px] text-primary">history_edu</span>
                                                        Activities
                                                    </li>
                                                    <div className="border-t border-surface-container my-1"></div>
                                                    {client.enabled ? (
                                                        <li
                                                            onClick={() => {
                                                                setSuspendClientId(client.id);
                                                                setActionConfirmText('');
                                                                setOpenActionId(null);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-rose-50 text-rose-600 cursor-pointer flex items-center gap-2.5 font-semibold transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[17px]">block</span>
                                                            Suspend Account
                                                        </li>
                                                    ) : (
                                                        <li
                                                            onClick={() => {
                                                                setReactivateClientId(client.id);
                                                                setActionConfirmText('');
                                                                setOpenActionId(null);
                                                            }}
                                                            className="px-4 py-2.5 hover:bg-emerald-50 text-emerald-600 cursor-pointer flex items-center gap-2.5 font-semibold transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[17px]">check_circle</span>
                                                            Reactivate Account
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 sm:px-6 py-4 border-t border-surface-container flex flex-wrap justify-between items-center gap-4 bg-surface-container-low/40 text-xs">
                <p className="text-on-surface-variant font-mono">
                    Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-primary">{endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> clients
                </p>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        className="p-1.5 border border-outline-variant bg-surface-container-lowest rounded-lg text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition"
                        aria-label="Previous Page"
                    >
                        <span className="material-symbols-outlined text-sm block">chevron_left</span>
                    </button>

                    <div className="flex items-center gap-1 px-1">
                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                                    safeCurrentPage === page 
                                        ? 'bg-primary text-on-primary shadow-xs' 
                                        : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant'
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
                        className="p-1.5 border border-outline-variant bg-surface-container-lowest rounded-lg text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition"
                        aria-label="Next Page"
                    >
                        <span className="material-symbols-outlined text-sm block">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Client Personal Detail Modal */}
            {detailModalClient && (
                <ClientDetailModal
                    client={detailModalClient}
                    onClose={() => setDetailModalClient(null)}
                    onToggleStatus={(c) => {
                        if (c.enabled) {
                            setSuspendClientId(c.id);
                            setActionConfirmText('');
                        } else {
                            setReactivateClientId(c.id);
                            setActionConfirmText('');
                        }
                    }}
                />
            )}

            {/* Client Activities Modal */}
            {activitiesModalClient && (
                <ClientActivitiesModal
                    clientId={activitiesModalClient.id}
                    clientName={activitiesModalClient.fullName || 'Client'}
                    clientEmail={activitiesModalClient.email}
                    onClose={() => setActivitiesModalClient(null)}
                />
            )}

            {/* Suspend Confirmation Modal */}
            {suspendClientId && targetSuspendClient && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-rose-500/20">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md font-bold text-rose-600 mb-2">Suspend Client Access</h3>
                            <p className="text-body-md text-on-surface-variant mb-6 text-xs leading-relaxed">
                                This will restrict <strong className="text-on-surface">{targetSuspendClient.fullName}</strong> from logging into their portal or booking new appointments.
                                <br /><br />
                                To proceed, type <strong className="text-on-surface font-bold select-none">{targetSuspendClient.fullName}</strong> below:
                            </p>

                            <input
                                type="text"
                                value={actionConfirmText}
                                onChange={(e) => setActionConfirmText(e.target.value)}
                                placeholder="Type client name here"
                                className="w-full bg-surface-container-low border border-rose-300 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold mb-6 text-center text-xs"
                            />

                            <div className="flex gap-3 justify-end text-xs font-bold">
                                <button
                                    onClick={() => {
                                        setSuspendClientId(null);
                                        setActionConfirmText('');
                                    }}
                                    className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspend}
                                    disabled={actionConfirmText !== targetSuspendClient.fullName || isProcessing}
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex justify-center items-center gap-1.5"
                                >
                                    {isProcessing ? (
                                        <>Suspending...</>
                                    ) : (
                                        <>Confirm Suspension</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reactivate Confirmation Modal */}
            {reactivateClientId && targetReactivateClient && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col border border-emerald-500/20">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="font-headline-md text-headline-md font-bold text-emerald-600 mb-2">Reactivate Client Account</h3>
                            <p className="text-body-md text-on-surface-variant mb-6 text-xs leading-relaxed">
                                This will instantly restore login and booking privileges for <strong className="text-on-surface">{targetReactivateClient.fullName}</strong>.
                                <br /><br />
                                To proceed, type <strong className="text-on-surface font-bold select-none">{targetReactivateClient.fullName}</strong> below:
                            </p>

                            <input
                                type="text"
                                value={actionConfirmText}
                                onChange={(e) => setActionConfirmText(e.target.value)}
                                placeholder="Type client name here"
                                className="w-full bg-surface-container-low border border-emerald-300 rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold mb-6 text-center text-xs"
                            />

                            <div className="flex gap-3 justify-end text-xs font-bold">
                                <button
                                    onClick={() => {
                                        setReactivateClientId(null);
                                        setActionConfirmText('');
                                    }}
                                    className="px-5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReactivate}
                                    disabled={actionConfirmText !== targetReactivateClient.fullName || isProcessing}
                                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex justify-center items-center gap-1.5"
                                >
                                    {isProcessing ? (
                                        <>Reactivating...</>
                                    ) : (
                                        <>Confirm Reactivation</>
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
