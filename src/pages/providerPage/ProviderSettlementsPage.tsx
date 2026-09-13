import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProviderSidebar from './components/ProviderSidebar';
import ProviderTopNavigation from './components/ProviderTopNavigation';
import { useOrganizationTerms } from '../../utils/organizationTerms';
import { applyTheme } from '../../utils/themeUtils';

export default function ProviderSettlementsPage() {
    const terms = useOrganizationTerms();
    const navigate = useNavigate();
    const [overview, setOverview] = useState<any>(null);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Detail Modal State
    const [selectedSettlement, setSelectedSettlement] = useState<any | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const orgName = localStorage.getItem('organizationName') || terms.facilityLabel || 'Golden Salon';

    // Theme & branding sync
    useEffect(() => {
        const cachedColor = localStorage.getItem('primaryAccentColor');
        if (cachedColor) {
            applyTheme(cachedColor);
        }
    }, []);

    const fetchProviderSettlements = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/provider/settlements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOverview(response.data);
            setSettlements(response.data.settlements || []);
            setIsLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch provider settlements:', err);
            setError(err.response?.data?.message || 'Failed to load your settlements.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProviderSettlements();
    }, []);

    const handleInspectDetail = async (date: string, initialRow?: any) => {
        try {
            if (initialRow) {
                setSelectedSettlement(initialRow);
            } else {
                setSelectedSettlement({ date, status: 'IN_ESCROW' });
            }
            setIsDetailLoading(true);
            setShowDetailModal(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/v1/provider/settlements/${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSettlement(response.data);
            setIsDetailLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch settlement detail:', err);
            setIsDetailLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!settlements.length) return;
        try {
            const headers = ['Settlement Date', 'Status', `${terms.appointmentPlural}`, 'Split %', 'Gross Attributed (NPR)', 'Net Take-Home (NPR)'];
            const rows = filteredSettlements.map((s: any) => {
                const sDate = s.date || s.settlementDate;
                const sStatus = s.status || s.settlementStatus;
                const appCount = s.appointmentsCount ?? s.totalAppointments ?? 0;
                const rate = s.commissionRate ?? s.providerCommissionRate ?? activeRate;
                const gross = s.attributedGross ?? s.grossRevenue ?? 0;
                const takeHome = s.netProviderPayout ?? s.netServiceProviderAmount ?? 0;
                return [sDate, sStatus, appCount, `${rate}%`, gross.toFixed(2), takeHome.toFixed(2)];
            });
            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `Daily_Settlements_${orgName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setNotification({ message: 'Settlement CSV exported successfully!', type: 'success' });
            setTimeout(() => setNotification(null), 4000);
        } catch (err) {
            console.error('Error exporting settlement CSV:', err);
            setNotification({ message: 'Failed to export CSV report.', type: 'error' });
            setTimeout(() => setNotification(null), 4000);
        }
    };

    const filteredSettlements = settlements.filter((s: any) => {
        const sStatus = s.status || s.settlementStatus;
        const matchesStatus = filterStatus === 'ALL' || sStatus === filterStatus;
        const sDate = String(s.date || s.settlementDate || '');
        const matchesSearch = sDate.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    // Pagination state & calculation
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchTerm]);

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

    const formatCurrency = (amount: number) => {
        return `रु ${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const totalTakeHomeSum = overview?.totalNetEarningsAllTime ?? settlements.reduce((acc, s) => acc + (s.netProviderPayout ?? s.netServiceProviderAmount ?? 0), 0);
    const thisMonthSum = overview?.thisMonthNetSettlement ?? 0;
    const todayInEscrowSum = overview?.todayProjectedEarnings ?? 0;
    const activeRate = overview?.activeCommissionRate ?? 70;

    return (
        <div className="tenant-theme bg-[#F3F4F6] text-[#151c27] font-sans min-h-screen flex overflow-x-hidden">
            <ProviderTopNavigation />
            <ProviderSidebar />

            {/* Main Content Area */}
            <main className="pt-24 pb-8 md:ml-64 px-4 md:px-10 flex-1 md:w-[calc(100%-256px)] overflow-y-auto">
                
                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all transform animate-bounce ${
                        notification.type === 'success' 
                            ? 'bg-[#e8fbf3] text-[#005438] border-[#6ffbbe]' 
                            : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]'
                    }`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {notification.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        <span>{notification.message}</span>
                    </div>
                )}

                {/* Page Header (Matching RevenueAnalyticsPage) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl sm:text-[32px] font-bold text-primary tracking-tight">
                                Daily Settlements
                            </h1>
                            {isLoading && (
                                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                            )}
                        </div>
                        <p className="text-sm font-medium text-[#53606c] mt-1">
                            Real-time take-home earnings, active split rate, and daily settlement batches for <span className="font-semibold text-primary">{orgName}</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={fetchProviderSettlements}
                            className="w-full sm:w-auto h-10 px-3.5 bg-white text-primary border border-[#c3c5d7] rounded-xl flex items-center justify-center gap-2 hover:bg-[#f9f9ff] transition-all shadow-sm font-semibold text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer whitespace-nowrap active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 leading-none">refresh</span>
                            <span className="text-[#151c27]">Refresh</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="w-full sm:w-auto h-10 bg-primary text-on-primary px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-sm font-semibold text-sm whitespace-nowrap cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px] shrink-0 leading-none">download</span>
                            <span className="whitespace-nowrap">Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards (Exact Styling from RevenueAnalyticsPage) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    
                    {/* Card 1: Total Take-Home */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    account_balance_wallet
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-[#005438] bg-[#6ffbbe]/30">
                                Settled
                            </span>
                        </div>
                        <p className="text-[#53606c] font-medium text-sm">Total Take-Home</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#151c27] mt-1 tracking-tight">
                            {formatCurrency(totalTakeHomeSum)}
                        </h3>
                        <p className="text-xs text-[#737686] mt-2 italic">Cumulative settled earnings</p>
                    </div>

                    {/* Card 2: This Month */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    calendar_month
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-[#005438] bg-[#6ffbbe]/30">
                                This Month
                            </span>
                        </div>
                        <p className="text-[#53606c] font-medium text-sm">This Month</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#151c27] mt-1 tracking-tight">
                            {formatCurrency(thisMonthSum)}
                        </h3>
                        <p className="text-xs text-[#737686] mt-2 italic">Earned during current month</p>
                    </div>

                    {/* Card 3: Today's In-Escrow */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-600 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    hourglass_top
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100">
                                In Escrow
                            </span>
                        </div>
                        <p className="text-[#53606c] font-medium text-sm">Today's In-Escrow</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#151c27] mt-1 tracking-tight">
                            {formatCurrency(todayInEscrowSum)}
                        </h3>
                        <p className="text-xs text-[#737686] mt-2 italic">Projected today take-home</p>
                    </div>

                    {/* Card 4: Active Split % */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#c3c5d7]/30 hover:-translate-y-1 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    pie_chart
                                </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-[#005438] bg-[#6ffbbe]/30">
                                Active Split
                            </span>
                        </div>
                        <p className="text-[#53606c] font-medium text-sm">Active Split Rate</p>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#151c27] mt-1 tracking-tight">
                            {activeRate}%
                        </h3>
                        <p className="text-xs text-[#737686] mt-2 italic">Contract commission split</p>
                    </div>
                </div>

                {/* Filter Bar (Matching Provider Style) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#c3c5d7]/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="relative w-full sm:w-80">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686] text-lg">search</span>
                        <input
                            type="text"
                            placeholder="Search date (YYYY-MM-DD)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#f9f9ff] border border-[#c3c5d7]/50 rounded-xl pl-10 pr-4 py-2 text-sm text-[#151c27] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                        {['ALL', 'IN_ESCROW', 'SETTLED'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    filterStatus === st
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'bg-[#f0f3ff] text-[#53606c] hover:bg-[#e2e8f8]'
                                }`}
                            >
                                {st === 'ALL' ? 'All Batches' : st === 'IN_ESCROW' ? 'In Escrow' : 'Settled & Locked'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settlements Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#c3c5d7]/30 overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-[#e2e8f8] flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-bold text-[#151c27]">Daily Settlement & Payout Batches</h2>
                        <span className="text-xs font-medium text-[#53606c]">{filteredSettlements.length} settlement days</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f0f3ff]/60 border-b border-[#e2e8f8]">
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c]">
                                        Settlement Date
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-center">
                                        Status
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-center">
                                        Your {terms.appointmentPlural}
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-center">
                                        Active Split %
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-right">
                                        Gross Attributed
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-right">
                                        Your Net Take-Home
                                    </th>
                                    <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#53606c] text-center">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f8] text-xs font-medium text-[#151c27]">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[#53606c]">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                                            <p>Loading your settlement records...</p>
                                        </td>
                                    </tr>
                                ) : filteredSettlements.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[#53606c]">
                                            <span className="material-symbols-outlined text-4xl mb-1 text-[#53606c]/40">receipt_long</span>
                                            <p>No daily settlements recorded yet for this criteria.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSettlements.map((s: any) => {
                                        const sDate = s.date || s.settlementDate;
                                        const sStatus = s.status || s.settlementStatus;
                                        const appCount = s.appointmentsCount ?? s.totalAppointments ?? 0;
                                        const rate = s.commissionRate ?? s.providerCommissionRate ?? activeRate;
                                        const gross = s.attributedGross ?? s.grossRevenue ?? 0;
                                        const takeHome = s.netProviderPayout ?? s.netServiceProviderAmount ?? 0;
                                        const isLocked = sStatus === 'SETTLED';

                                        return (
                                            <tr key={sDate} className="hover:bg-[#f9f9ff] transition-colors group">
                                                <td className="px-6 py-4 font-bold text-primary whitespace-nowrap font-mono">
                                                    {sDate}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {isLocked ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-[#005438] bg-[#6ffbbe]/30">
                                                             <span className="w-1.5 h-1.5 rounded-full bg-[#005438]"></span>
                                                             SETTLED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100">
                                                             <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                                             IN ESCROW
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-[#151c27]">
                                                    {appCount}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-primary">
                                                    {rate}%
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap text-[#53606c] font-medium">
                                                    {formatCurrency(gross)}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-extrabold text-primary text-sm">
                                                    {formatCurrency(takeHome)}
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleInspectDetail(sDate, s)}
                                                        className="px-3.5 py-1.5 text-xs font-bold border border-[#c3c5d7] rounded-xl bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination (Fully dynamic and theme-adaptive) */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <p className="text-xs text-[#53606c] font-mono">
                        Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-primary">{endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> active settlement batches
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button 
                            type="button"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safeCurrentPage <= 1}
                            className="p-2 border border-[#c3c5d7] bg-white rounded-lg text-[#53606c] hover:bg-[#f0f3ff] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                            aria-label="Previous Page"
                        >
                            <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center">chevron_left</span>
                        </button>
                        <div className="flex items-center gap-1 px-1">
                            {getPageNumbers().map(page => (
                                <button 
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition shadow-sm cursor-pointer ${
                                        safeCurrentPage === page 
                                            ? 'bg-primary text-on-primary shadow-primary/20' 
                                            : 'bg-white hover:bg-[#f0f3ff] text-[#53606c] border border-[#c3c5d7]'
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
                            className="p-2 border border-[#c3c5d7] bg-white rounded-lg text-[#53606c] hover:bg-[#f0f3ff] disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                            aria-label="Next Page"
                        >
                            <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center">chevron_right</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Provider Settlement Detail Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#c3c5d7] my-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-[#e2e8f8] pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#151c27] flex items-center gap-2">
                                        Settlement Breakdown: <span className="text-primary">{selectedSettlement?.date || selectedSettlement?.settlementDate || selectedSettlement?.summary?.settlementDate}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-[#53606c]">Status:</span>
                                        {(selectedSettlement?.status === 'SETTLED' || selectedSettlement?.settlementStatus === 'SETTLED' || selectedSettlement?.summary?.settlementStatus === 'SETTLED' || selectedSettlement?.isLocked) ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6ffbbe]/25 text-[#005438] border border-[#6ffbbe]/50">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#005438]"></span>
                                                SETTLED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                IN ESCROW
                                            </span>
                                        )}
                                        {selectedSettlement?.settledAt && (
                                            <span className="text-[11px] text-[#737686] italic">
                                                • Finalized {selectedSettlement.settledAt}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-lg bg-[#f0f3ff] text-[#53606c] hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {isDetailLoading && !selectedSettlement ? (
                            <div className="py-16 text-center text-[#53606c]">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                                <p>Loading detailed breakdown...</p>
                            </div>
                        ) : selectedSettlement ? (() => {
                            const modalAppCount = selectedSettlement?.appointmentsCount ?? selectedSettlement?.appointments?.length ?? selectedSettlement?.summary?.totalAppointments ?? 0;
                            const modalCommRate = selectedSettlement?.commissionRate ?? activeRate;
                            const modalAttributedGross = selectedSettlement?.attributedGross ?? selectedSettlement?.grossRevenue ?? selectedSettlement?.summary?.grossRevenue ?? 0;
                            const modalNetPayout = selectedSettlement?.netProviderPayout ?? selectedSettlement?.netServiceProviderAmount ?? selectedSettlement?.providerPayoutsTotal ?? selectedSettlement?.summary?.providerPayoutsTotal ?? 0;
                            const apptList = selectedSettlement?.appointments || [];

                            return (
                                <div className="space-y-6">
                                    {/* Earnings Calculation Breakdown */}
                                    <div className="bg-[#f0f3ff]/60 rounded-xl p-5 border border-[#e2e8f8] space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#53606c]">
                                            Your Earnings Calculation
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                                            <div>
                                                <span className="text-[#53606c] block">Your Total {terms.appointmentPlural}</span>
                                                <span className="font-bold text-[#151c27] text-sm">{modalAppCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-[#53606c] block">Commission Rate</span>
                                                <span className="font-bold text-primary text-sm">{modalCommRate}%</span>
                                            </div>
                                            <div>
                                                <span className="text-[#53606c] block">Attributed Gross</span>
                                                <span className="font-bold text-[#151c27] text-sm">{formatCurrency(modalAttributedGross)}</span>
                                            </div>
                                            <div className="p-2 rounded bg-primary/10 border border-primary/20">
                                                <span className="text-primary font-semibold block text-[10px]">Net Take-Home Payout</span>
                                                <span className="font-extrabold text-primary text-sm">{formatCurrency(modalNetPayout)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Appointment Itemization */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-[#151c27] flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                                            Your Completed {terms.appointmentPlural} in Batch
                                        </h4>
                                        <div className="border border-[#e2e8f8] rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-[#f0f3ff]/80 text-[#53606c] font-bold uppercase tracking-wider sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-2.5">Booking ID</th>
                                                        <th className="px-4 py-2.5">{terms.customerSingular}</th>
                                                        <th className="px-4 py-2.5">{terms.serviceSingular}</th>
                                                        <th className="px-4 py-2.5 text-right">Price</th>
                                                        <th className="px-4 py-2.5 text-right">Refund</th>
                                                        <th className="px-4 py-2.5 text-right">Your Cut</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#e2e8f8] font-medium">
                                                    {(apptList.length === 0) ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-4 py-6 text-center text-[#53606c]">
                                                                No specific {terms.appointmentPlural.toLowerCase()} listed for this batch.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        apptList.map((app: any) => (
                                                            <tr key={app.appointmentId} className="hover:bg-[#f9f9ff]">
                                                                <td className="px-4 py-2.5 font-mono text-primary font-bold">#{app.appointmentId}</td>
                                                                <td className="px-4 py-2.5 font-medium text-[#151c27]">{app.customerName}</td>
                                                                <td className="px-4 py-2.5 text-[#53606c]">{app.serviceName || 'Standard Service'}</td>
                                                                <td className="px-4 py-2.5 text-right text-[#151c27] font-semibold">{formatCurrency(app.gross ?? app.price)}</td>
                                                                <td className="px-4 py-2.5 text-right text-[#ba1a1a]">{(app.refund ?? app.refundAmount) > 0 ? `-${formatCurrency(app.refund ?? app.refundAmount)}` : '-'}</td>
                                                                <td className="px-4 py-2.5 text-right font-bold text-primary">{formatCurrency(app.providerPayout ?? app.netProviderAmount ?? 0)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })() : null}

                        <div className="flex justify-end pt-3 border-t border-[#e2e8f8]">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2 bg-[#f0f3ff] hover:bg-[#e2e8f8] text-primary font-semibold text-xs rounded-xl transition-colors cursor-pointer"
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
