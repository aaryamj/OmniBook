import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

interface SettlementSummary {
    id: number | null;
    tenantId: number;
    tenantName: string;
    organizationType: string;
    settlementDate: string;
    totalAppointments: number;
    grossRevenue: number;
    totalRefunds: number;
    netRetained: number;
    platformCommissionRate: number;
    platformCommission: number;
    gatewayFees: number;
    remainingOrgAmount: number;
    providerPayoutsTotal: number;
    orgAdminPayout: number;
    settlementStatus: string;
    isLocked: boolean;
    settledAt: string | null;
    settledBy: string | null;
}

interface ProviderShare {
    providerId: number;
    providerName: string;
    specialtyOrRole: string;
    appointmentsCount: number;
    attributedGross: number;
    commissionRate: number;
    netProviderPayout: number;
    netOrgShare: number;
}

interface AppointmentItem {
    appointmentId: number;
    time: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    providerName: string;
    paymentMethod: string;
    gross: number;
    refund: number;
    netRetained: number;
    gatewayFee: number;
    platformFee: number;
    remainingOrg: number;
    providerPayout: number;
    orgAdminPayout: number;
    status: string;
    settlementStatus: string;
}

interface SettlementDetail {
    summary: SettlementSummary;
    providerShares: ProviderShare[];
    appointments: AppointmentItem[];
    isEligibleForFinalization: boolean;
}

interface TenantItem {
    id: number;
    organizationName: string;
    organizationType: string;
}

export default function SuperAdminSettlements() {
    const [loading, setLoading] = useState(true);
    const [tenants, setTenants] = useState<TenantItem[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');
    const [selectedOrgType, setSelectedOrgType] = useState<string>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [overview, setOverview] = useState<{
        totalSettledRevenue: number;
        totalPlatformEarnings: number;
        totalGatewayFees: number;
        totalSettledBatches: number;
        pendingEscrowBatches: number;
        settlements: SettlementSummary[];
    }>({
        totalSettledRevenue: 0,
        totalPlatformEarnings: 0,
        totalGatewayFees: 0,
        totalSettledBatches: 0,
        pendingEscrowBatches: 0,
        settlements: []
    });

    const [selectedDetail, setSelectedDetail] = useState<SettlementDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        fetchSettlements();
    }, [selectedTenantId, selectedOrgType, selectedStatus]);

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/tenants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTenants(res.data || []);
        } catch (err) {
            console.error('Failed to load tenants', err);
        }
    };

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (selectedTenantId !== 'ALL') params.append('tenantId', selectedTenantId);
            if (selectedOrgType !== 'ALL') params.append('orgType', selectedOrgType);
            if (selectedStatus !== 'ALL') params.append('status', selectedStatus);

            const res = await axios.get(`http://localhost:8080/api/v1/superadmin/settlements?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOverview(res.data);
        } catch (err) {
            console.error('Failed to load settlements', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (tenantId: number, date: string) => {
        setDetailLoading(true);
        setShowModal(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/v1/superadmin/settlements/${tenantId}/${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedDetail(res.data);
        } catch (err) {
            console.error('Failed to load settlement detail', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const filteredSettlements = (overview.settlements || []).filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            s.tenantName?.toLowerCase().includes(q) ||
            s.organizationType?.toLowerCase().includes(q) ||
            s.settlementDate?.includes(q)
        );
    });

    // --- Pagination State & Dynamic Calculations ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset pagination to page 1 whenever search, filters, or page size change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTenantId, selectedOrgType, selectedStatus, pageSize]);

    const totalEntries = filteredSettlements.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const paginatedSettlements = filteredSettlements.slice(startIndex, endIndex);

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

    const getOrgBadgeColor = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'HEALTHCARE':
            case 'CLINIC':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'BEAUTY_WELLNESS':
            case 'SALON':
                return 'bg-pink-50 text-pink-700 border-pink-200';
            case 'EDUCATION':
            case 'COLLEGE':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'FITNESS':
            case 'GYM':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            default:
                return 'bg-purple-50 text-purple-700 border-purple-200';
        }
    };

    const formatCurrency = (val: number) => {
        return `Rs. ${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />

                {/* Main Content Area - Properly offset from fixed sidebar and topnav */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">

                        {/* Page Heading */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary">
                                        Daily Settlements Audit Hub
                                    </h2>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        FINANCIAL LEDGER
                                    </span>
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                    Monitor, audit, and verify cross-organization daily revenue splits and platform commissions.
                                </p>
                            </div>

                            <button
                                onClick={fetchSettlements}
                                className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">refresh</span>
                                Refresh Ledger
                            </button>
                        </div>

                        {/* KPI Metric Cards (Matching SystemKPI styling) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {/* Card 1: Total Revenue Settled */}
                            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                        <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                                    </div>
                                    <div className="flex items-center space-x-1 font-mono-data text-label-md text-emerald-600 font-bold">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        <span>{overview.totalSettledBatches} Locked</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-headline-lg font-headline-lg font-bold text-primary transition-all duration-500">
                                        {formatCurrency(overview.totalSettledRevenue)}
                                    </h3>
                                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                                        TOTAL REVENUE SETTLED
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant mt-1">Permanently locked audit volume</p>
                                </div>
                            </div>

                            {/* Card 2: Platform Earnings (10%) */}
                            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <span className="material-symbols-outlined text-2xl">payments</span>
                                    </div>
                                    <div className="flex items-center space-x-1 font-mono-data text-label-md text-blue-600 font-bold">
                                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                        <span>10% SaaS</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-headline-lg font-headline-lg font-bold text-blue-600 transition-all duration-500">
                                        {formatCurrency(overview.totalPlatformEarnings)}
                                    </h3>
                                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                                        PLATFORM EARNINGS (10%)
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant mt-1">OmniBook fee on net retained</p>
                                </div>
                            </div>

                            {/* Card 3: Gateway Fees */}
                            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                                    </div>
                                    <span className="text-on-surface-variant font-mono-data text-label-md">eSewa & Stripe</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-headline-lg font-headline-lg font-bold text-primary transition-all duration-500">
                                        {formatCurrency(overview.totalGatewayFees)}
                                    </h3>
                                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                                        GATEWAY FEES PROCESSED
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant mt-1">Payment processor deductions</p>
                                </div>
                            </div>

                            {/* Card 4: Pending Escrow Batches */}
                            <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col justify-between border border-surface-container shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
                                    </div>
                                    <div className="flex items-center space-x-1 font-mono-data text-label-md text-purple-600 font-bold">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                                        <span>Live</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-headline-lg font-headline-lg font-bold text-purple-600 transition-all duration-500">
                                        {overview.pendingEscrowBatches}
                                    </h3>
                                    <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                                        PENDING ESCROW BATCHES
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant mt-1">Active unfinalized settlement pools</p>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
                            <div className="relative w-full lg:w-96">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Filter by organization, industry, date..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                {/* Tenant Filter */}
                                <select
                                    value={selectedTenantId}
                                    onChange={(e) => setSelectedTenantId(e.target.value)}
                                    className="bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                                >
                                    <option value="ALL">All Organizations</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.organizationName}</option>
                                    ))}
                                </select>

                                {/* Industry Type Filter */}
                                <select
                                    value={selectedOrgType}
                                    onChange={(e) => setSelectedOrgType(e.target.value)}
                                    className="bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                                >
                                    <option value="ALL">All Industries</option>
                                    <option value="HEALTHCARE">Healthcare</option>
                                    <option value="CLINIC">Clinic</option>
                                    <option value="BEAUTY_WELLNESS">Beauty & Salon</option>
                                    <option value="EDUCATION">Education / College</option>
                                    <option value="FITNESS">Fitness & Gym</option>
                                </select>

                                {/* Settlement Status Filter */}
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="IN_ESCROW">In Escrow (Accumulating)</option>
                                    <option value="SETTLED">Settled & Locked</option>
                                </select>
                            </div>
                        </div>

                        {/* Settlements Table */}
                        <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/40">
                                <div>
                                    <h3 className="text-body-lg font-bold text-primary">Daily Settlement Ledger</h3>
                                    <p className="text-xs text-on-surface-variant">
                                        Showing {totalEntries} daily batch distribution records
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-container">
                                            <th className="py-3.5 px-4">Date</th>
                                            <th className="py-3.5 px-4">Organization</th>
                                            <th className="py-3.5 px-4 text-center">Appts</th>
                                            <th className="py-3.5 px-4 text-right">Gross Booking</th>
                                            <th className="py-3.5 px-4 text-right">Refunds</th>
                                            <th className="py-3.5 px-4 text-right">Net Retained</th>
                                            <th className="py-3.5 px-4 text-right">Platform (10%)</th>
                                            <th className="py-3.5 px-4 text-right">Provider Share</th>
                                            <th className="py-3.5 px-4 text-right">Org Profit</th>
                                            <th className="py-3.5 px-4 text-center">Status</th>
                                            <th className="py-3.5 px-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container text-xs font-medium text-on-surface">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={11} className="py-12 text-center text-on-surface-variant">
                                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent mb-2"></div>
                                                    <p>Loading settlement batches...</p>
                                                </td>
                                            </tr>
                                        ) : filteredSettlements.length === 0 ? (
                                            <tr>
                                                <td colSpan={11} className="py-12 text-center text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-4xl mb-1 text-on-surface-variant/40">receipt_long</span>
                                                    <p className="text-sm">No settlement batches match your filter criteria.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedSettlements.map((s, idx) => {
                                                const status = s.settlementStatus || 'IN_ESCROW';
                                                const isLocked = s.isLocked || status === 'SETTLED';

                                                return (
                                                    <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                                                        <td className="py-3 px-4 font-mono-data font-bold text-primary whitespace-nowrap">
                                                            {s.settlementDate}
                                                        </td>
                                                        <td className="py-3 px-4 whitespace-nowrap">
                                                            <div className="font-bold text-primary">{s.tenantName || 'Unknown Org'}</div>
                                                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getOrgBadgeColor(s.organizationType)}`}>
                                                                {s.organizationType || 'ORGANIZATION'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center font-bold text-primary">
                                                            {s.totalAppointments}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium text-on-surface">
                                                            {formatCurrency(s.grossRevenue)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-error font-medium">
                                                            {(s.totalRefunds || 0) > 0 ? `-${formatCurrency(s.totalRefunds)}` : 'Rs. 0'}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-primary">
                                                            {formatCurrency(s.netRetained)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-blue-600">
                                                            {formatCurrency(s.platformCommission)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-medium text-purple-600">
                                                            {formatCurrency(s.providerPayoutsTotal)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-emerald-600">
                                                            {formatCurrency(s.orgAdminPayout)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                                            {isLocked ? (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                    <span className="material-symbols-outlined text-[12px]">lock</span>
                                                                    SETTLED
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                    <span className="material-symbols-outlined text-[12px] animate-spin">hourglass_empty</span>
                                                                    IN ESCROW
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleViewDetail(s.tenantId, s.settlementDate)}
                                                                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs border border-outline-variant flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                                Audit
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Dynamic Pagination Bar matching Superadmin & CRM */}
                            <div className="p-4 border-t border-surface-container bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-xs text-on-surface-variant font-mono-data">
                                        Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0} - {endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> settlement batches
                                        {totalEntries !== (overview.settlements || []).length && (
                                            <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                                (filtered from {(overview.settlements || []).length} total)
                                            </span>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                                        <span>Rows:</span>
                                        <select
                                            value={pageSize}
                                            onChange={(e) => setPageSize(Number(e.target.value))}
                                            className="bg-surface-container-lowest py-1 px-2 rounded border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer"
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
                                        className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
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
                                                        : 'border border-outline-variant/40 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/40'
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
                                        className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                        aria-label="Next Page"
                                    >
                                        Next
                                        <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Audit Breakdown Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-surface-container-lowest text-on-surface rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-surface-container shadow-2xl my-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-start border-b border-surface-container pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-primary">
                                        Settlement Audit Breakdown
                                    </h3>
                                    {selectedDetail?.summary?.isLocked ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">lock</span>
                                            PERMANENTLY LOCKED
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                                            LIVE ESCROW
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1">
                                    Organization: <strong className="text-primary">{selectedDetail?.summary?.tenantName}</strong> | Date: <strong className="text-primary">{selectedDetail?.summary?.settlementDate}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="py-12 text-center text-on-surface-variant">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-secondary border-t-transparent mb-2"></div>
                                <p>Loading batch audit details...</p>
                            </div>
                        ) : selectedDetail ? (
                            <div className="space-y-6">
                                {/* 4-Tier Waterfall Summary */}
                                <div className="bg-surface-container-low/50 rounded-xl p-4 border border-surface-container space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                        4-Tier Financial Calculation Engine
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                                        <div>
                                            <span className="text-on-surface-variant block">1. Gross Volume</span>
                                            <span className="font-bold text-primary text-sm">{formatCurrency(selectedDetail.summary.grossRevenue)}</span>
                                        </div>
                                        <div>
                                            <span className="text-on-surface-variant block">Refunds Deducted</span>
                                            <span className="font-bold text-error text-sm">-{formatCurrency(selectedDetail.summary.totalRefunds)}</span>
                                        </div>
                                        <div>
                                            <span className="text-on-surface-variant block">2. Net Retained</span>
                                            <span className="font-bold text-primary text-sm">{formatCurrency(selectedDetail.summary.netRetained)}</span>
                                        </div>
                                        <div>
                                            <span className="text-on-surface-variant block">Platform SaaS Cut (10%)</span>
                                            <span className="font-bold text-blue-600 text-sm">-{formatCurrency(selectedDetail.summary.platformCommission)}</span>
                                        </div>
                                        <div>
                                            <span className="text-on-surface-variant block">Gateway Processing Fees</span>
                                            <span className="font-bold text-amber-600 text-sm">-{formatCurrency(selectedDetail.summary.gatewayFees)}</span>
                                        </div>
                                        <div>
                                            <span className="text-on-surface-variant block">3. Remaining Org Amount</span>
                                            <span className="font-bold text-primary text-sm">{formatCurrency(selectedDetail.summary.remainingOrgAmount)}</span>
                                        </div>
                                        <div className="p-2 rounded bg-purple-50 border border-purple-200">
                                            <span className="text-purple-700 font-semibold block text-[10px]">4a. Providers Payout</span>
                                            <span className="font-bold text-purple-700 text-sm">{formatCurrency(selectedDetail.summary.providerPayoutsTotal)}</span>
                                        </div>
                                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                                            <span className="text-emerald-700 font-semibold block text-[10px]">4b. Org Admin Profit</span>
                                            <span className="font-bold text-emerald-700 text-sm">{formatCurrency(selectedDetail.summary.orgAdminPayout)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Shares Table */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-purple-600 text-[18px]">group</span>
                                        Service Provider Allocations
                                    </h4>
                                    <div className="border border-surface-container rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="py-2.5 px-3">Provider</th>
                                                    <th className="py-2.5 px-3">Specialty / Role</th>
                                                    <th className="py-2.5 px-3 text-center">Appointments</th>
                                                    <th className="py-2.5 px-3 text-center">Split %</th>
                                                    <th className="py-2.5 px-3 text-right">Attributed Gross</th>
                                                    <th className="py-2.5 px-3 text-right">Net Payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container">
                                                {(selectedDetail.providerShares || []).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="py-4 text-center text-on-surface-variant">
                                                            No specific provider payouts calculated for this batch.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    selectedDetail.providerShares.map(ps => (
                                                        <tr key={ps.providerId} className="hover:bg-surface-container-low/40">
                                                            <td className="py-2.5 px-3 font-bold text-primary">{ps.providerName}</td>
                                                            <td className="py-2.5 px-3 text-on-surface-variant">{ps.specialtyOrRole || 'General'}</td>
                                                            <td className="py-2.5 px-3 text-center font-bold text-primary">{ps.appointmentsCount}</td>
                                                            <td className="py-2.5 px-3 text-center font-bold text-blue-600">{ps.commissionRate}%</td>
                                                            <td className="py-2.5 px-3 text-right">{formatCurrency(ps.attributedGross)}</td>
                                                            <td className="py-2.5 px-3 text-right font-bold text-purple-600">{formatCurrency(ps.netProviderPayout)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Appointment Items */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-blue-600 text-[18px]">checklist</span>
                                        Eligible Appointment Transactions ({selectedDetail.appointments?.length || 0})
                                    </h4>
                                    <div className="border border-surface-container rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider sticky top-0">
                                                <tr>
                                                    <th className="py-2 px-3">ID</th>
                                                    <th className="py-2 px-3">Customer</th>
                                                    <th className="py-2 px-3">Provider</th>
                                                    <th className="py-2 px-3">Paid Price</th>
                                                    <th className="py-2 px-3">Refund</th>
                                                    <th className="py-2 px-3">Net Retained</th>
                                                    <th className="py-2 px-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container">
                                                {(selectedDetail.appointments || []).map(a => (
                                                    <tr key={a.appointmentId} className="hover:bg-surface-container-low/40">
                                                        <td className="py-2 px-3 font-mono-data text-blue-600 font-bold">#{a.appointmentId}</td>
                                                        <td className="py-2 px-3 font-medium text-primary">{a.customerName}</td>
                                                        <td className="py-2 px-3 text-on-surface-variant">{a.providerName}</td>
                                                        <td className="py-2 px-3 font-medium text-primary">{formatCurrency(a.gross)}</td>
                                                        <td className="py-2 px-3 text-error">{a.refund > 0 ? `-${formatCurrency(a.refund)}` : '-'}</td>
                                                        <td className="py-2 px-3 font-bold text-primary">{formatCurrency(a.netRetained)}</td>
                                                        <td className="py-2 px-3 text-center">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-low text-primary">
                                                                {a.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="flex justify-end pt-3 border-t border-surface-container">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-surface-container-low hover:bg-surface-container text-primary font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                                Close Audit View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
