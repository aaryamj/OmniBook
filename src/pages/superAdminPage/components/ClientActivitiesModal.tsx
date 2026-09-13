import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { getOrganizationTerms } from '../../../utils/organizationTerms';

interface SuperadminClientActivity {
    appointmentId: number;
    tenantId: number;
    organizationName: string;
    organizationType: string;
    providerId: number;
    providerName: string;
    providerSpecialty: string;
    providerProfilePicture?: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    appointmentStatus: string;
    price: number;
    paymentMethod: string;
    paymentStatus: string;
    billingStatus: string;
    transactionId?: string;
    bookedAt?: string;
    approvedAt?: string;
    checkedInAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    rejectedAt?: string;
    cancellationReason?: string;
    rejectionReason?: string;
    treatmentSummary?: string;
}

interface ClientActivitiesModalProps {
    clientId: number;
    clientName: string;
    clientEmail?: string;
    onClose: () => void;
}

export default function ClientActivitiesModal({ clientId, clientName, clientEmail, onClose }: ClientActivitiesModalProps) {
    const [activities, setActivities] = useState<SuperadminClientActivity[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters inside modal
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8080/api/v1/superadmin/clients/${clientId}/activities`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setActivities(res.data || []);
            } catch (error) {
                console.error("Failed to fetch client activities", error);
            } finally {
                setLoading(false);
            }
        };

        if (clientId) {
            fetchActivities();
        }
    }, [clientId]);

    const filteredActivities = useMemo(() => {
        return activities.filter(act => {
            // Status filter
            if (statusFilter !== 'ALL' && act.appointmentStatus !== statusFilter) {
                return false;
            }

            // Date filter
            if (dateFilter && act.appointmentDate !== dateFilter) {
                return false;
            }

            // Keyword search
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase().trim();
                const org = (act.organizationName || '').toLowerCase();
                const prov = (act.providerName || '').toLowerCase();
                const srv = (act.serviceName || '').toLowerCase();
                const stat = (act.appointmentStatus || '').toLowerCase();
                const tx = (act.transactionId || '').toLowerCase();
                const bill = (act.billingStatus || '').toLowerCase();
                const pm = (act.paymentMethod || '').toLowerCase();

                const matches = org.includes(q) || prov.includes(q) || srv.includes(q) || stat.includes(q) || tx.includes(q) || bill.includes(q) || pm.includes(q);
                if (!matches) return false;
            }

            return true;
        });
    }, [activities, statusFilter, dateFilter, searchTerm]);

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '';
        try {
            const [h, m] = timeStr.split(':');
            const hour = parseInt(h, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            return `${formattedHour}:${m} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    const formatTimestamp = (ts?: string) => {
        if (!ts) return null;
        try {
            return new Date(ts).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return ts;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'IN_CONSULTATION':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'SCHEDULED':
            case 'CHECKED_IN':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'REJECTED':
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getBillingBadge = (billing?: string) => {
        const b = billing || '';
        if (b.includes('Cash')) {
            return {
                style: 'bg-emerald-50 text-[#059669] border-emerald-200 font-semibold',
                icon: 'payments'
            };
        } else if (b.includes('eSewa')) {
            return {
                style: 'bg-green-50 text-[#10b981] border-green-200 font-semibold',
                icon: 'check_circle'
            };
        } else if (b.includes('Stripe')) {
            return {
                style: 'bg-indigo-50 text-[#6366f1] border-indigo-200 font-semibold',
                icon: 'verified'
            };
        }
        return {
            style: 'bg-slate-100 text-slate-600 border-slate-200',
            icon: 'pending'
        };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest text-on-surface border border-surface-container w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* Modal Header */}
                <div className="p-5 sm:p-6 bg-surface-container-low border-b border-surface-container flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">history_edu</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-headline-sm font-bold text-on-surface flex items-center gap-2">
                                Client Activities &amp; Appointment Ledger
                            </h2>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                Surveillance log for <span className="font-bold text-primary">{clientName}</span> {clientEmail && `(${clientEmail})`}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="p-4 bg-surface-container-lowest border-b border-surface-container flex flex-wrap items-center justify-between gap-3 text-xs">
                    
                    {/* Keyword Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base pointer-events-none">
                            search
                        </span>
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search facility, provider, service, TX ID..."
                            className="w-full pl-9 pr-7 py-2 bg-surface-container-low rounded-xl border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                            >
                                <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                        )}
                    </div>

                    {/* Date Picker Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-on-surface-variant font-medium">Date:</span>
                        <input 
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-mono"
                        />
                    </div>

                    {/* Status Dropdown Filter */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-on-surface-variant font-medium">Status:</span>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant text-xs text-on-surface font-semibold focus:outline-none focus:border-primary cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="IN_CONSULTATION">In Consultation</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    {(searchTerm || dateFilter || statusFilter !== 'ALL') && (
                        <button 
                            onClick={() => { setSearchTerm(''); setDateFilter(''); setStatusFilter('ALL'); }}
                            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                            Reset
                        </button>
                    )}
                </div>

                {/* Activities List Area */}
                <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
                    {loading ? (
                        <div className="py-16 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl animate-spin mb-2 text-primary">progress_activity</span>
                            <p className="font-semibold text-sm">Loading client activity trail...</p>
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-16 text-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-5xl mb-2 opacity-40 block">event_busy</span>
                            <p className="font-bold text-sm text-on-surface">No activities match your filters.</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                                {activities.length === 0 ? "This client has not booked any appointments yet." : "Try adjusting the date, status, or search keywords."}
                            </p>
                        </div>
                    ) : (
                        filteredActivities.map((act) => {
                            const terms = getOrganizationTerms(act.organizationType || 'Clinic');
                            const billing = getBillingBadge(act.billingStatus);

                            return (
                                <div 
                                    key={act.appointmentId} 
                                    className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/60 hover:border-primary/40 transition-all shadow-sm space-y-4"
                                >
                                    {/* Top Row: Organization, Provider & Status */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                <span className="material-symbols-outlined text-xl">
                                                    {(act.organizationType || '').toLowerCase().includes('college') ? 'school' :
                                                     (act.organizationType || '').toLowerCase().includes('saloon') || (act.organizationType || '').toLowerCase().includes('salon') ? 'content_cut' :
                                                     (act.organizationType || '').toLowerCase().includes('clinic') || (act.organizationType || '').toLowerCase().includes('hospital') ? 'local_hospital' :
                                                     'apartment'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-bold text-sm text-on-surface">{act.organizationName}</h3>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                                                        {terms.facilityLabel}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-on-surface-variant">
                                                        Appt #{act.appointmentId}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant mt-0.5">
                                                    {terms.providerSingular}: <span className="font-semibold text-on-surface">{act.providerName}</span> ({act.providerSpecialty})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(act.appointmentStatus)}`}>
                                                {act.appointmentStatus.replace(/_/g, ' ')}
                                            </span>
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                {act.appointmentType === 'VIRTUAL' ? 'Virtual (Online)' : terms.inFacility}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Row: Schedule, Service, Payment Details */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-[11px] text-on-surface-variant block mb-0.5">Service</span>
                                            <span className="font-bold text-on-surface text-sm">{act.serviceName}</span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-on-surface-variant block mb-0.5">Schedule Date &amp; Time</span>
                                            <span className="font-semibold text-on-surface font-mono">
                                                {act.appointmentDate} at {formatTime(act.appointmentTime)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-on-surface-variant block mb-0.5">Fee &amp; Payment Method</span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-emerald-600 font-mono text-sm">
                                                    Rs. {Number(act.price || 0).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-medium text-on-surface">
                                                    {act.paymentMethod || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-on-surface-variant block mb-0.5">Payment Verification</span>
                                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${billing.style}`}>
                                                <span className="material-symbols-outlined text-[14px]">{billing.icon}</span>
                                                {act.billingStatus || (act.paymentStatus === 'SUCCESS' || act.paymentStatus === 'PAID' ? 'Verified' : 'Pending')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Transaction & Reference ID if present */}
                                    {act.transactionId && (
                                        <div className="text-[11px] text-on-surface-variant bg-surface-container p-2.5 rounded-xl border border-outline-variant/40 flex items-center justify-between flex-wrap gap-2">
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm text-primary">receipt_long</span>
                                                Gateway Reference / Transaction ID:
                                            </span>
                                            <span className="font-mono font-bold text-on-surface select-all">
                                                {act.transactionId}
                                            </span>
                                        </div>
                                    )}

                                    {/* Lifecycle Audit Trail Timestamps */}
                                    <div className="pt-2 border-t border-outline-variant/40">
                                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                                            Lifecycle Audit Timestamps:
                                        </span>
                                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-on-surface-variant">
                                            {act.bookedAt && (
                                                <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30">
                                                    <span className="material-symbols-outlined text-xs text-blue-500">edit_calendar</span>
                                                    Booked: <strong className="text-on-surface">{formatTimestamp(act.bookedAt)}</strong>
                                                </span>
                                            )}
                                            {act.approvedAt && (
                                                <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30">
                                                    <span className="material-symbols-outlined text-xs text-purple-500">verified</span>
                                                    Approved: <strong className="text-on-surface">{formatTimestamp(act.approvedAt)}</strong>
                                                </span>
                                            )}
                                            {act.checkedInAt && (
                                                <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30">
                                                    <span className="material-symbols-outlined text-xs text-emerald-500">how_to_reg</span>
                                                    Checked In: <strong className="text-on-surface">{formatTimestamp(act.checkedInAt)}</strong>
                                                </span>
                                            )}
                                            {act.completedAt && (
                                                <span className="inline-flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-outline-variant/30">
                                                    <span className="material-symbols-outlined text-xs text-green-600">task_alt</span>
                                                    Completed: <strong className="text-on-surface">{formatTimestamp(act.completedAt)}</strong>
                                                </span>
                                            )}
                                            {act.cancelledAt && (
                                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200">
                                                    <span className="material-symbols-outlined text-xs">cancel</span>
                                                    Cancelled: <strong>{formatTimestamp(act.cancelledAt)}</strong> {act.cancellationReason && `(${act.cancellationReason})`}
                                                </span>
                                            )}
                                            {act.rejectedAt && (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-300">
                                                    <span className="material-symbols-outlined text-xs">block</span>
                                                    Rejected: <strong>{formatTimestamp(act.rejectedAt)}</strong> {act.rejectionReason && `(${act.rejectionReason})`}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Treatment / Summary Notes if available */}
                                    {act.treatmentSummary && (
                                        <div className="bg-surface p-3 rounded-xl border border-outline-variant/30">
                                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide block mb-1">
                                                {terms.summaryLabel || 'Consultation Summary'}:
                                            </span>
                                            <p className="text-xs text-on-surface italic">{act.treatmentSummary}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-mono">
                        Showing <strong className="text-primary">{filteredActivities.length}</strong> of <strong className="text-primary">{activities.length}</strong> total activities
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-on-primary-fixed-variant transition-colors"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
