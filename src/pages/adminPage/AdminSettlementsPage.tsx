import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../superAdminPage/superAdmin.css';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import { useOrganizationTerms } from '../../utils/organizationTerms';
import { applyTheme } from '../../utils/themeUtils';

export default function AdminSettlementsPage() {
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

    // Finalize Modal State
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [targetFinalizeDate, setTargetFinalizeDate] = useState<string | null>(null);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Sync Tenant Theme on Mount
    useEffect(() => {
        const accent = localStorage.getItem('primaryAccentColor') || localStorage.getItem('tenantAccentColor');
        if (accent) {
            applyTheme(accent);
        }
    }, []);

    const fetchSettlements = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/settlements', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOverview(response.data);
            setSettlements(response.data.settlements || []);
            setIsLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch admin settlements:', err);
            setError(err.response?.data?.message || 'Failed to load daily settlements.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettlements();
    }, []);

    const handleInspectDetail = async (date: string) => {
        try {
            setIsDetailLoading(true);
            setShowDetailModal(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/v1/admin/settlements/${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSettlement(response.data);
            setIsDetailLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch settlement detail:', err);
            setToastMessage('Could not retrieve audit detail for this settlement date.');
            setIsDetailLoading(false);
        }
    };

    const handleOpenFinalize = (date: string) => {
        setTargetFinalizeDate(date);
        setShowFinalizeModal(true);
    };

    const handleConfirmFinalize = async () => {
        if (!targetFinalizeDate) return;
        try {
            setIsFinalizing(true);
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/v1/admin/settlements/${targetFinalizeDate}/finalize`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsFinalizing(false);
            setShowFinalizeModal(false);
            setToastMessage(`Daily Settlement for ${targetFinalizeDate} has been permanently locked and finalized!`);
            fetchSettlements();
        } catch (err: any) {
            console.error('Failed to finalize settlement:', err);
            setIsFinalizing(false);
            alert(err.response?.data?.message || 'Failed to finalize settlement.');
        }
    };

    const filteredSettlements = settlements.filter((s: any) => {
        const sStatus = s.settlementStatus || s.status;
        const matchesStatus = filterStatus === 'ALL' || sStatus === filterStatus;
        const sDate = String(s.settlementDate || '');
        const sBy = String(s.settledBy || s.finalizedBy || '');
        const matchesSearch = sDate.includes(searchTerm) || sBy.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // --- Pagination State & Dynamic Calculations ---
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset pagination to page 1 whenever any filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, pageSize]);

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

    const formatCurrency = (amount: number, currency: string = 'NPR') => {
        return `${currency === 'USD' ? '$' : 'Rs. '} ${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Aggregate metrics across batches
    const totalRetainedSum = settlements.reduce((acc, s) => acc + (s.netRetained ?? s.netRetainedAmount ?? 0), 0);
    const totalOrgNetSum = overview?.totalOrgNetProfit ?? settlements.reduce((acc, s) => acc + (s.orgAdminPayout ?? s.netAdminAmount ?? 0), 0);
    const totalProviderSum = overview?.totalProviderPayouts ?? settlements.reduce((acc, s) => acc + (s.providerPayoutsTotal ?? s.netServiceProviderAmount ?? 0), 0);
    const totalFeesSum = (overview?.totalPlatformFeesPaid ?? 0) + settlements.reduce((acc, s) => acc + (s.gatewayFees ?? s.paymentGatewayFee ?? 0), 0);

    const todayBatch = settlements.find((s: any) => {
        const todayStr = new Date().toISOString().split('T')[0];
        return s.settlementDate === todayStr;
    }) || settlements[0];

    const todayStatus = todayBatch ? (todayBatch.settlementStatus || todayBatch.status) : 'IN_ESCROW';

    return (
        <div className="tenant-theme min-h-screen bg-[#F8FAFC] text-on-surface font-sans">
            <AdminSidebar />
            <div className="flex-1 lg:ml-[280px] ml-0 ml-sidebar-width flex flex-col min-w-0">
                <TopNavigation />

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 bg-primary-container text-on-primary-container px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-on-primary-container/20">
                        <span className="material-symbols-outlined text-green-400">check_circle</span>
                        <span className="text-sm font-semibold">{toastMessage}</span>
                        <button onClick={() => setToastMessage(null)} className="ml-3 text-on-primary-container/70 hover:text-white cursor-pointer">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="pt-24 pb-gutter px-gutter min-h-screen flex flex-col bg-[#F8FAFC]">
                    <div className="flex flex-col gap-6 max-w-container-max mx-auto w-full animate-fade-in">

                        {/* Workspace Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary tracking-tight">
                                    Daily Settlements & Revenue
                                </h2>
                                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                                    Manage automated 4-tier daily batch distributions between {terms.providerPlural}, the organization, and platform gateway fees.
                                </p>
                            </div>

                            <div className="flex items-center gap-3 flex-nowrap shrink-0">
                                <button
                                    onClick={fetchSettlements}
                                    className="px-4 py-2 border border-outline-variant rounded bg-white text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all flex items-center gap-2 cursor-pointer shadow-sm whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                    Refresh
                                </button>
                                {todayBatch && todayStatus === 'IN_ESCROW' && (
                                    <button
                                        onClick={() => handleOpenFinalize(todayBatch.settlementDate)}
                                        className="px-4 py-2 bg-primary text-on-primary rounded font-semibold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Finalize Today's Batch
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* KPI Cards (Matching Admin KPI Architecture & Brand Colors) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Card 1: Gross Retained */}
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-primary transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Gross Retained
                                    </p>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-on-primary">
                                        <span className="material-symbols-outlined text-[20px]">payments</span>
                                    </div>
                                </div>
                                <p className="font-headline-lg text-headline-lg font-black text-primary tracking-tight">
                                    {formatCurrency(totalRetainedSum)}
                                </p>
                                <div className="mt-3 flex items-center text-on-surface-variant text-xs gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-green-600">check_circle</span>
                                    <span>Gross volume minus refunds</span>
                                </div>
                            </div>

                            {/* Card 2: Organization Profit */}
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-primary transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                                        {terms.facilityLabel} Profit
                                    </p>
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center transition-colors group-hover:bg-green-700 group-hover:text-white">
                                        <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                    </div>
                                </div>
                                <p className="font-headline-lg text-headline-lg font-black text-green-700 tracking-tight">
                                    {formatCurrency(totalOrgNetSum)}
                                </p>
                                <div className="mt-3 flex items-center text-on-surface-variant text-xs gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-green-600">trending_up</span>
                                    <span>Retained net organization take</span>
                                </div>
                            </div>

                            {/* Card 3: Provider Payouts */}
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-primary transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                                        {terms.providerPlural} Payouts
                                    </p>
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center transition-colors group-hover:bg-purple-700 group-hover:text-white">
                                        <span className="material-symbols-outlined text-[20px]">groups</span>
                                    </div>
                                </div>
                                <p className="font-headline-lg text-headline-lg font-black text-purple-700 tracking-tight">
                                    {formatCurrency(totalProviderSum)}
                                </p>
                                <div className="mt-3 flex items-center text-on-surface-variant text-xs gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-purple-600">badge</span>
                                    <span>Allocated to active {terms.providerPlural.toLowerCase()}</span>
                                </div>
                            </div>

                            {/* Card 4: Platform & Gateway Fees */}
                            <div className="bg-white p-6 border border-outline-variant rounded shadow-sm hover:border-primary transition-all group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                                        Platform & Gateway
                                    </p>
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center transition-colors group-hover:bg-amber-700 group-hover:text-white">
                                        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                    </div>
                                </div>
                                <p className="font-headline-lg text-headline-lg font-black text-amber-700 tracking-tight">
                                    {formatCurrency(totalFeesSum)}
                                </p>
                                <div className="mt-3 flex items-center text-on-surface-variant text-xs gap-1">
                                    <span className="material-symbols-outlined text-[15px] text-amber-600">tune</span>
                                    <span>OmniBook 10% & processing</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Daily Settlement Escrow Card (Matching Primary Brand Colors) */}
                        {todayBatch && (
                            <div className="bg-primary-container text-white rounded-2xl p-6 sm:p-7 shadow-xl relative overflow-hidden border border-on-primary-container/20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container opacity-10 blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <span className="flex h-3 w-3 relative">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${todayStatus === 'SETTLED' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-3 w-3 ${todayStatus === 'SETTLED' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                            </span>
                                            <span className="font-label-md text-label-md font-bold uppercase tracking-widest text-on-primary-container">
                                                Batch: {todayBatch.settlementDate}
                                            </span>
                                            <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${todayStatus === 'SETTLED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                                                {todayStatus === 'SETTLED' ? 'LOCKED & SETTLED' : 'ACCUMULATING (IN ESCROW)'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                            {todayBatch.totalAppointments} {terms.appointmentPlural} in Today's Batch
                                        </h3>
                                        <p className="text-xs sm:text-sm text-on-primary-container max-w-xl leading-relaxed">
                                            {todayStatus === 'SETTLED'
                                                ? 'This batch is finalized and permanently locked for audit. Any transaction arriving afterward rolls forward to the next calendar batch.'
                                                : 'All completed appointments remain securely in escrow until midnight closing or manual admin finalization.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                                        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 text-left sm:text-right shrink-0">
                                            <span className="text-[11px] font-bold text-on-primary-container uppercase tracking-wider block whitespace-nowrap">
                                                Estimated Org Net
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-white block mt-0.5 whitespace-nowrap font-mono-data">
                                                {formatCurrency(todayBatch.orgAdminPayout ?? todayBatch.netAdminAmount ?? 0)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleInspectDetail(todayBatch.settlementDate)}
                                            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            Live Breakdown
                                        </button>

                                        {todayStatus === 'IN_ESCROW' && (
                                            <button
                                                onClick={() => handleOpenFinalize(todayBatch.settlementDate)}
                                                className="px-5 py-3 bg-primary text-on-primary font-bold text-xs rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                                Finalize Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Master Filter Engine (Matching Image 1 CRM Filter Bar) */}
                        <div className="bg-white border border-outline-variant p-2 flex flex-col lg:flex-row gap-2 rounded shadow-sm">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Search by settlement date (YYYY-MM-DD), finalized admin, or status..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border-none bg-surface-container-lowest pl-10 pr-4 py-2 focus:ring-0 text-body-md text-on-surface outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto">
                                {['ALL', 'IN_ESCROW', 'SETTLED'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setFilterStatus(st)}
                                        className={`px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                            filterStatus === st
                                                ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                                                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                                        }`}
                                    >
                                        {st === 'ALL' ? 'All Settlements' : st === 'IN_ESCROW' ? 'In Escrow' : 'Settled & Locked'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Master Data Table (Matching Image 1 CRM Table Style) */}
                        <div className="bg-white border border-outline-variant overflow-x-auto custom-scrollbar rounded shadow-sm">
                            <table className="w-full min-w-[950px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low border-b border-outline-variant">
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider">
                                            Settlement Date
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-center">
                                            {terms.appointmentPlural}
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            Gross Booking
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            Refunds
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            Net Retained
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            Platform (10%)
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            {terms.providerPlural} Share
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-right">
                                            {terms.facilityLabel} Profit
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 font-label-md text-label-md uppercase text-on-surface-variant tracking-wider text-center">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container-low text-xs font-medium text-on-surface">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-12 text-center text-on-surface-variant">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                                                <p>Loading daily settlement records...</p>
                                            </td>
                                        </tr>
                                    ) : filteredSettlements.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-12 text-center text-on-surface-variant">
                                                <span className="material-symbols-outlined text-4xl mb-1 text-on-surface-variant/40">receipt_long</span>
                                                <p>No settlement batches found for this criteria.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedSettlements.map((s: any) => {
                                            const status = s.settlementStatus || s.status;
                                            const isLocked = s.isLocked || status === 'SETTLED';
                                            const netRetained = s.netRetained ?? s.netRetainedAmount ?? 0;
                                            const platformComm = s.platformCommission ?? s.platformCommissionAmount ?? 0;
                                            const provPayout = s.providerPayoutsTotal ?? s.netServiceProviderAmount ?? 0;
                                            const orgNet = s.orgAdminPayout ?? s.netAdminAmount ?? 0;

                                            return (
                                                <tr key={s.id || s.settlementDate} className="hover:bg-primary/5 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap font-mono-data">
                                                        {s.settlementDate}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap font-bold text-on-surface">
                                                        {s.totalAppointments}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap font-semibold text-on-surface">
                                                        {formatCurrency(s.grossRevenue)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap text-error font-medium">
                                                        {(s.totalRefunds || 0) > 0 ? `-${formatCurrency(s.totalRefunds)}` : 'Rs. 0'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-primary">
                                                        {formatCurrency(netRetained)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap text-on-surface-variant font-medium">
                                                        {formatCurrency(platformComm)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-purple-700">
                                                        {formatCurrency(provPayout)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-green-700">
                                                        {formatCurrency(orgNet)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        {isLocked ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                SETTLED
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                IN ESCROW
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                                                        <button
                                                            onClick={() => handleInspectDetail(s.settlementDate)}
                                                            className="h-8 min-w-[105px] px-3 text-xs font-bold border border-outline-variant rounded bg-white text-on-surface hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer inline-flex items-center justify-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                            View Details
                                                        </button>
                                                        {status === 'IN_ESCROW' && (
                                                            <button
                                                                onClick={() => handleOpenFinalize(s.settlementDate)}
                                                                className="h-8 min-w-[105px] px-3 bg-primary text-on-primary font-bold text-xs rounded hover:brightness-110 active:scale-95 transition-all shadow-sm shadow-primary/20 cursor-pointer inline-flex items-center justify-center gap-1"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">lock</span>
                                                                Finalize
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination & Summary Bar */}
                        <div className="bg-white px-6 py-4 border border-outline-variant rounded flex flex-wrap items-center justify-between gap-4 mt-2 mb-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-on-surface-variant font-mono-data">
                                    Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0} - {endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> active settlement records
                                    {totalEntries !== settlements.length && (
                                        <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                            (filtered from {settlements.length} total)
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
                    </div>
                </main>
            </div>

            {/* Audit & Payout Breakdown Modal */}
            {showDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-outline-variant my-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-primary">
                                        Settlement Audit Breakdown: {selectedSettlement?.summary?.settlementDate || selectedSettlement?.settlementDate}
                                    </h3>
                                    <p className="text-xs text-on-surface-variant">
                                        Status: <strong className="text-primary">{selectedSettlement?.summary?.settlementStatus || selectedSettlement?.status || 'IN_ESCROW'}</strong> | Permanent Audit Locked: {(selectedSettlement?.summary?.isLocked ?? selectedSettlement?.locked) ? 'YES (Immutable)' : 'NO (Live Escrow)'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary flex items-center justify-center cursor-pointer transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {isDetailLoading ? (
                            <div className="py-16 text-center text-on-surface-variant">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
                                <p>Loading detailed breakdown...</p>
                            </div>
                        ) : selectedSettlement ? (
                            <div className="space-y-6">
                                {/* 4-Tier Waterfall Card */}
                                {(() => {
                                    const sum = selectedSettlement.summary || selectedSettlement;
                                    return (
                                        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                                                4-Tier Financial Calculation Engine
                                            </h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                                                <div>
                                                    <span className="text-on-surface-variant block">1. Gross Volume</span>
                                                    <span className="font-bold text-primary text-sm">{formatCurrency(sum.grossRevenue)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-on-surface-variant block">Customer Refunds</span>
                                                    <span className="font-bold text-error text-sm">-{formatCurrency(sum.totalRefunds || 0)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-on-surface-variant block">2. Net Retained</span>
                                                    <span className="font-bold text-primary text-sm">{formatCurrency(sum.netRetained ?? sum.netRetainedAmount)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-on-surface-variant block">Platform Cut ({sum.platformCommissionRate}%)</span>
                                                    <span className="font-bold text-blue-700 text-sm">-{formatCurrency(sum.platformCommission ?? sum.platformCommissionAmount)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-on-surface-variant block">Payment Gateway Fee</span>
                                                    <span className="font-bold text-amber-700 text-sm">-{formatCurrency(sum.gatewayFees ?? sum.paymentGatewayFee)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-on-surface-variant block">3. Remaining Org Amount</span>
                                                    <span className="font-bold text-primary text-sm">{formatCurrency(sum.remainingOrgAmount ?? sum.grossRemainingOrgAmount)}</span>
                                                </div>
                                                <div className="p-2 rounded bg-purple-50 border border-purple-200">
                                                    <span className="text-purple-700 font-semibold block text-[10px]">4a. {terms.providerPlural} Total</span>
                                                    <span className="font-bold text-purple-700 text-sm">{formatCurrency(sum.providerPayoutsTotal ?? sum.netServiceProviderAmount)}</span>
                                                </div>
                                                <div className="p-2 rounded bg-green-50 border border-green-200">
                                                    <span className="text-green-700 font-semibold block text-[10px]">4b. {terms.facilityLabel} Net Profit</span>
                                                    <span className="font-bold text-green-700 text-sm">{formatCurrency(sum.orgAdminPayout ?? sum.netAdminAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Provider Shares Table */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-600 text-lg">groups</span>
                                        {terms.providerSingular} Payout Allocations
                                    </h4>
                                    <div className="border border-outline-variant rounded-xl overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-4 py-2.5">{terms.providerSingular}</th>
                                                    <th className="px-4 py-2.5">Specialty / Role</th>
                                                    <th className="px-4 py-2.5 text-center">Completed {terms.appointmentPlural}</th>
                                                    <th className="px-4 py-2.5 text-center">Commission %</th>
                                                    <th className="px-4 py-2.5 text-right">Gross Cut</th>
                                                    <th className="px-4 py-2.5 text-right">Net Payout</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container-low font-medium">
                                                {(selectedSettlement.providerShares || []).length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-4 py-6 text-center text-on-surface-variant">
                                                            No specific provider payouts calculated for this batch.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    selectedSettlement.providerShares.map((ps: any) => (
                                                        <tr key={ps.providerId} className="hover:bg-primary/5">
                                                            <td className="px-4 py-3 font-bold text-primary">{ps.providerName}</td>
                                                            <td className="px-4 py-3 text-on-surface-variant">{ps.specialtyOrRole || ps.specialty || 'General'}</td>
                                                            <td className="px-4 py-3 text-center font-bold text-primary">{ps.appointmentsCount ?? ps.appointmentCount}</td>
                                                            <td className="px-4 py-3 text-center font-bold text-primary">{ps.commissionRate}%</td>
                                                            <td className="px-4 py-3 text-right">{formatCurrency(ps.attributedGross ?? ps.grossProviderAmount)}</td>
                                                            <td className="px-4 py-3 text-right font-bold text-purple-700">
                                                                {formatCurrency(ps.netProviderPayout ?? ps.netProviderAmount)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Appointment Itemization */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">checklist</span>
                                        Eligible Transaction Itemization
                                    </h4>
                                    <div className="border border-outline-variant rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase tracking-wider sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2.5">Booking ID</th>
                                                    <th className="px-4 py-2.5">{terms.customerSingular}</th>
                                                    <th className="px-4 py-2.5">{terms.providerSingular}</th>
                                                    <th className="px-4 py-2.5 text-right">Paid</th>
                                                    <th className="px-4 py-2.5 text-right">Refunded</th>
                                                    <th className="px-4 py-2.5 text-right">Net Retained</th>
                                                    <th className="px-4 py-2.5 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-surface-container-low font-medium">
                                                {(selectedSettlement.appointments || []).map((app: any) => (
                                                    <tr key={app.appointmentId} className="hover:bg-primary/5">
                                                        <td className="px-4 py-2.5 font-mono-data text-primary font-bold">#{app.appointmentId}</td>
                                                        <td className="px-4 py-2.5 font-medium text-primary">{app.customerName}</td>
                                                        <td className="px-4 py-2.5 text-on-surface-variant">{app.providerName}</td>
                                                        <td className="px-4 py-2.5 text-right text-primary font-semibold">{formatCurrency(app.gross ?? app.price)}</td>
                                                        <td className="px-4 py-2.5 text-right text-error">{(app.refund ?? app.refundAmount) > 0 ? `-${formatCurrency(app.refund ?? app.refundAmount)}` : '-'}</td>
                                                        <td className="px-4 py-2.5 text-right font-bold text-primary">{formatCurrency(app.netRetained)}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface">
                                                                {app.status}
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

                        <div className="flex justify-end pt-3 border-t border-outline-variant">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-5 py-2 bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                                Close Audit View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Finalization Confirmation Modal */}
            {showFinalizeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-5 animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-2xl">lock</span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-primary">
                                Finalize & Lock Settlement for {targetFinalizeDate}?
                            </h3>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                This action permanently locks this calendar day's batch into the audit ledger. 
                                Financial distributions for your organization and {terms.providerPlural} will be permanently snapshotted.
                                <strong className="text-primary block mt-1.5 font-semibold">
                                    Any transaction paid or completed afterward will automatically carry forward to the next open settlement day.
                                </strong>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => setShowFinalizeModal(false)}
                                disabled={isFinalizing}
                                className="flex-1 px-4 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmFinalize}
                                disabled={isFinalizing}
                                className="flex-1 px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isFinalizing ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Locking...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <span>Confirm & Lock</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
