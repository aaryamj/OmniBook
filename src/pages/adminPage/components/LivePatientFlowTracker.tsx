import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOrganizationTerms } from '../../../utils/organizationTerms';
import AdminAppointmentDetailModal from './AdminAppointmentDetailModal';

interface LivePatientFlowDTO {
    id: number;
    time: string;
    patientName: string;
    patientId: string;
    service: string;
    providerName: string;
    status: string;
    billingStatus: string;
    paymentMethod?: string;
    paymentStatus?: string;
    price?: number;
}

interface LivePatientFlowTrackerProps {
    flows: LivePatientFlowDTO[];
    onRefresh?: () => void;
}

export default function LivePatientFlowTracker({ flows = [], onRefresh }: LivePatientFlowTrackerProps) {
    const terms = useOrganizationTerms();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [detailsModal, setDetailsModal] = useState<LivePatientFlowDTO | null>(null);
    const [statusModal, setStatusModal] = useState<LivePatientFlowDTO | null>(null);
    const [newStatus, setNewStatus] = useState('');

    // Payment Recording state
    const [paymentModal, setPaymentModal] = useState<LivePatientFlowDTO | null>(null);
    const [payMethod, setPayMethod] = useState('CASH');
    const [payAmount, setPayAmount] = useState<number | string>('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    // Search and Status Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Reset pagination to page 1 on filter or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, pageSize]);

    // Dynamic filtering
    const filteredFlows = flows.filter(flow => {
        const matchesStatus = statusFilter === 'ALL' || flow.status === statusFilter;
        if (!matchesStatus) return false;

        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();

        const pName = (flow.patientName || '').toLowerCase();
        const pId = String(flow.patientId || '').toLowerCase();
        const srv = (flow.service || '').toLowerCase();
        const prov = (flow.providerName || '').toLowerCase();
        const stat = (flow.status || '').toLowerCase().replace(/_/g, ' ');
        const bill = (flow.billingStatus || '').toLowerCase();
        const time = (flow.time || '').toLowerCase();

        return pName.includes(term) ||
               pId.includes(term) ||
               srv.includes(term) ||
               prov.includes(term) ||
               stat.includes(term) ||
               bill.includes(term) ||
               time.includes(term);
    });

    // Pagination calculations
    const totalEntries = filteredFlows.length;
    const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = totalEntries === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const paginatedFlows = filteredFlows.slice(startIndex, endIndex);

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

    const toggleDropdown = (id: number) => {
        if (openDropdownId === id) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(id);
        }
    };

    const handleUpdateStatus = async () => {
        if (!statusModal || !newStatus) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/appointments/${statusModal.id}/status?status=${newStatus}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatusModal(null);
            setNewStatus('');
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status. Please try again.");
        }
    };

    const handleCancelAppointment = async (id: number) => {
        if (!window.confirm(`Are you sure you want to cancel this ${terms.appointmentSingular.toLowerCase()}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/admin/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            alert(`Failed to cancel ${terms.appointmentSingular.toLowerCase()}.`);
        }
    };

    const handleRecordPayment = async () => {
        if (!paymentModal) return;
        setIsSavingPayment(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/appointments/${paymentModal.id}/payment`, {
                paymentMethod: payMethod,
                paymentStatus: 'SUCCESS',
                amount: Number(payAmount) || 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentModal(null);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Failed to record payment", error);
            alert("Failed to record payment. Please try again.");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'IN_CONSULTATION':
                return "bg-secondary/15 text-secondary border border-secondary/30";
            case 'WAITING':
            case 'CHECKED_IN':
                return "bg-amber-500/15 text-amber-800 border border-amber-500/30";
            case 'COMPLETED':
                return "bg-[#10b981]/15 text-[#005438] border border-[#10b981]/30";
            case 'CANCELLED':
                return "bg-red-500/10 text-red-700 border border-red-500/20";
            case 'REJECTED':
                return "bg-gray-400/15 text-gray-700 border border-gray-400/30";
            case 'SCHEDULED':
                return "bg-blue-500/15 text-blue-700 border border-blue-500/30";
            default:
                return "bg-surface-variant text-on-surface-variant border border-outline-variant";
        }
    };

    const formatStatusLabel = (status: string) => {
        if (status === 'IN_CONSULTATION') {
            return terms.inConsult.toUpperCase();
        }
        return status.replace(/_/g, ' ');
    };

    const getBillingStyle = (billing: string) => {
        if (billing.includes("Cash")) {
            return "text-[#059669] font-semibold";
        } else if (billing.includes("eSewa")) {
            return "text-[#10b981] font-semibold";
        } else if (billing.includes("Stripe")) {
            return "text-[#6366f1] font-semibold";
        } else if (billing.includes("Verified")) {
            return "text-primary font-semibold";
        }
        return "text-on-surface-variant opacity-60";
    };

    const getBillingIcon = (billing: string) => {
        if (billing.includes("Cash")) {
            return "payments";
        } else if (billing.includes("eSewa")) {
            return "check_circle";
        } else if (billing.includes("Stripe") || billing.includes("Verified")) {
            return "verified";
        }
        return "pending";
    };

    return (
        <div className="glass-card rounded-2xl flex flex-col w-full h-full relative overflow-hidden shadow-sm border border-surface-container-high bg-surface">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-surface-container-high flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">dynamic_feed</span>
                    </div>
                    <div>
                        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                            Live {terms.customerSingular} Flow Tracker
                        </h2>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                            Real-time monitoring of today's {terms.customerPlural.toLowerCase()} and {terms.appointmentPlural.toLowerCase()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/60 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-on-surface font-mono-data">System Live</span>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="px-5 sm:px-6 py-3.5 bg-surface-container-low/50 border-b border-surface-container-high flex flex-wrap items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                        search
                    </span>
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${terms.customerPlural.toLowerCase()}, ID, ${terms.serviceSingular.toLowerCase()}, ${terms.providerSingular.toLowerCase()}...`}
                        className="w-full pl-9 pr-8 py-2 bg-surface rounded-xl border border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button 
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-xs p-1 rounded-full cursor-pointer"
                            title="Clear search"
                        >
                            <span className="material-symbols-outlined text-sm leading-none block">close</span>
                        </button>
                    )}
                </div>

                {/* Filter by Status & Page Size */}
                <div className="flex items-center flex-wrap gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-base text-primary">filter_list</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-surface py-2 px-3 rounded-xl border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-sm cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="WAITING">Waiting</option>
                            <option value="IN_CONSULTATION">{terms.inConsult}</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <span className="hidden sm:inline">Rows:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="bg-surface py-2 px-2.5 rounded-xl border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-sm cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-surface-container-low text-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">
                        <tr>
                            <th className="px-6 py-4 font-bold">Time</th>
                            <th className="px-6 py-4 font-bold">{terms.customerSingular} Name</th>
                            <th className="px-6 py-4 font-bold">{terms.serviceSingular}</th>
                            <th className="px-6 py-4 font-bold">Assigned {terms.providerSingular}</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                            <th className="px-6 py-4 font-bold">Billing/Verification</th>
                            <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high text-xs">
                        {flows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40 block">event_busy</span>
                                    <p className="font-medium text-sm">No {terms.customerPlural.toLowerCase()} recorded for this period.</p>
                                </td>
                            </tr>
                        ) : filteredFlows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40 block">search_off</span>
                                    <p className="font-medium text-sm">No {terms.customerPlural.toLowerCase()} found matching your filter criteria.</p>
                                    <button 
                                        type="button"
                                        onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                                        className="mt-3 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                        Reset Search & Filters
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            paginatedFlows.map((flow) => (
                                <tr key={flow.id} className="hover:bg-surface-container-low/70 transition-colors">
                                    <td className="px-6 py-4 font-mono-data text-[13px] text-on-surface-variant font-medium">
                                        {flow.time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-on-surface">{flow.patientName}</p>
                                        <p className="text-[11px] text-on-surface-variant font-mono">ID: {flow.patientId}</p>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface font-medium">{flow.service}</td>
                                    <td className="px-6 py-4 text-on-surface font-medium">{flow.providerName}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(flow.status)}`}>
                                            {formatStatusLabel(flow.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 font-mono-data text-[11px] font-medium ${getBillingStyle(flow.billingStatus)}`}>
                                            <span className="material-symbols-outlined text-[15px]">{getBillingIcon(flow.billingStatus)}</span>
                                            {flow.billingStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center relative">
                                        <button 
                                            type="button"
                                            onClick={() => toggleDropdown(flow.id)}
                                            className="material-symbols-outlined text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                                            aria-label="Actions"
                                        >
                                            more_vert
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        {openDropdownId === flow.id && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-10" 
                                                    onClick={() => setOpenDropdownId(null)}
                                                ></div>
                                                <div className="absolute right-6 top-10 mt-1 w-48 bg-surface border border-outline-variant rounded-xl shadow-xl z-20 overflow-hidden py-1 text-left">
                                                    <button 
                                                        type="button"
                                                        className="w-full text-left px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-high hover:text-primary flex items-center gap-2 transition-colors cursor-pointer font-medium"
                                                        onClick={() => {
                                                            setDetailsModal(flow);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[17px] text-primary">visibility</span>
                                                        View Details
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="w-full text-left px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-high hover:text-primary flex items-center gap-2 transition-colors cursor-pointer font-medium"
                                                        onClick={() => {
                                                            setStatusModal(flow);
                                                            setNewStatus(flow.status);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[17px] text-primary">edit_calendar</span>
                                                        Update Status
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="w-full text-left px-4 py-2.5 text-xs text-on-surface hover:bg-surface-container-high hover:text-primary flex items-center gap-2 transition-colors cursor-pointer font-medium"
                                                        onClick={() => {
                                                            setPaymentModal(flow);
                                                            setPayMethod(flow.paymentMethod && flow.paymentMethod !== 'N/A' ? flow.paymentMethod : 'CASH');
                                                            setPayAmount(flow.price !== undefined && flow.price !== null ? flow.price : '');
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[17px] text-[#059669]">payments</span>
                                                        Record Payment
                                                    </button>
                                                    <div className="border-t border-outline-variant/60 my-1"></div>
                                                    <button 
                                                        type="button"
                                                        className="w-full text-left px-4 py-2.5 text-xs text-error hover:bg-error/10 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                                                        onClick={() => {
                                                            handleCancelAppointment(flow.id);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-[17px]">cancel</span>
                                                        Cancel {terms.appointmentSingular}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-5 sm:px-6 py-4 border-t border-surface-container-high flex flex-wrap justify-between items-center gap-4 bg-surface-container-low/30">
                <p className="text-xs text-on-surface-variant font-mono">
                    Showing <span className="font-bold text-primary">{totalEntries > 0 ? startIndex + 1 : 0}</span> to <span className="font-bold text-primary">{endIndex}</span> of <span className="font-bold text-primary">{totalEntries}</span> {terms.customerPlural.toLowerCase()}
                    {(searchTerm || statusFilter !== 'ALL') && totalEntries !== flows.length && (
                        <span className="ml-1 text-[11px] text-on-surface-variant/70 font-sans">
                            (filtered from {flows.length} total)
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button 
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        className="p-2 border border-outline-variant bg-surface rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                        aria-label="Previous Page"
                    >
                        <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center">chevron_left</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 px-1">
                        {getPageNumbers().map(page => (
                            <button 
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                                    safeCurrentPage === page 
                                        ? 'bg-primary text-on-primary shadow-primary/25 ring-1 ring-primary' 
                                        : 'bg-surface hover:bg-surface-container-high text-on-surface-variant border border-outline-variant hover:border-primary/40'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button 
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages || totalEntries === 0}
                        className="p-2 border border-outline-variant bg-surface rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                        aria-label="Next Page"
                    >
                        <span className="material-symbols-outlined text-sm leading-none flex items-center justify-center">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Details Modal */}
            {detailsModal && (
                <AdminAppointmentDetailModal 
                    appointmentId={detailsModal.id}
                    onClose={() => setDetailsModal(null)}
                />
            )}

            {/* Status Update Modal */}
            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-2xl border border-surface-container-high animate-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">edit_calendar</span>
                                </div>
                                <h3 className="font-headline-sm text-on-surface font-bold">Update Status</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setStatusModal(null)} 
                                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg cursor-pointer"
                            >
                                close
                            </button>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-4">
                            Select the new progress status for <span className="font-bold text-on-surface">{statusModal.patientName}</span>'s {terms.appointmentSingular.toLowerCase()}.
                        </p>
                        <select 
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full bg-surface-container p-3 rounded-xl border border-outline-variant text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all mb-6 cursor-pointer"
                        >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="WAITING">Waiting</option>
                            <option value="IN_CONSULTATION">{terms.inConsult}</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <div className="flex gap-2.5 justify-end">
                            <button 
                                type="button"
                                onClick={() => setStatusModal(null)} 
                                className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleUpdateStatus} 
                                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 cursor-pointer"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Recording Modal */}
            {paymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-2xl border border-surface-container-high animate-in">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">payments</span>
                                </div>
                                <h3 className="font-headline-sm text-on-surface font-bold">Record Payment</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setPaymentModal(null)} 
                                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 rounded-lg cursor-pointer"
                            >
                                close
                            </button>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded-xl mb-4 border border-outline-variant/60 text-xs">
                            <p className="font-bold text-on-surface">{paymentModal.patientName}</p>
                            <p className="text-on-surface-variant text-[11px] mt-0.5">{terms.serviceSingular}: {paymentModal.service} • Assigned: {paymentModal.providerName}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-on-surface-variant">Current Status:</span>
                                <span className={`font-mono font-bold ${getBillingStyle(paymentModal.billingStatus)}`}>
                                    {paymentModal.billingStatus}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-on-surface mb-1">
                                    Payment Method
                                </label>
                                <select 
                                    value={payMethod}
                                    onChange={(e) => setPayMethod(e.target.value)}
                                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                                >
                                    <option value="CASH">Cash (On-Site Counter)</option>
                                    <option value="ESEWA">eSewa (Digital Wallet)</option>
                                    <option value="STRIPE">Stripe (Online / Card)</option>
                                    <option value="CARD">Point of Sale (POS / Card)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-on-surface mb-1">
                                    Amount (Rs.)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    placeholder="Enter amount paid"
                                    className="w-full bg-surface-container p-2.5 rounded-xl border border-outline-variant text-on-surface text-xs font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 justify-end">
                            <button 
                                type="button"
                                onClick={() => setPaymentModal(null)} 
                                className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                disabled={isSavingPayment}
                                onClick={handleRecordPayment} 
                                className="px-4 py-2 bg-[#059669] text-white rounded-xl text-xs font-bold hover:bg-[#059669]/90 transition-all shadow-sm shadow-[#059669]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {isSavingPayment ? (
                                    <>
                                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">check</span>
                                        Confirm Payment
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
