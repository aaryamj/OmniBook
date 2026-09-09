import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

export interface SupportTicketItem {
    id: number;
    ticketNumber: string;
    organizationName: string;
    organizationType?: string;
    requesterName?: string;
    adminAccount: string;
    issueType: string;
    subject?: string;
    message?: string;
    priority: string;
    status: string;
    slaTimeRemaining: string;
    slaStatusClass: string;
    slaTextColor: string;
    statusBg: string;
    statusText: string;
    createdAt?: string;
}

export interface SupportKPIs {
    openTickets: number;
    avgResolution: string;
    slaBreaches: number;
    csatScore: string;
}

type FilterType = 'All Tickets' | 'Critical (SLA)' | 'Billing Issues' | 'Integration Bugs';

export default function SuperAdminSupport() {
    // Active filters
    const [activeFilter, setActiveFilter] = useState<FilterType>('All Tickets');
    const [timeFilter, setTimeFilter] = useState<string>('Last 30 Days');

    // Data states
    const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
    const [kpis, setKpis] = useState<SupportKPIs>({
        openTickets: 0,
        avgResolution: '1.4h',
        slaBreaches: 0,
        csatScore: '98.4%'
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Ticket Action Modal state (Replaces localhost alert)
    const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Announcement Modal states
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('Scheduled Infrastructure Maintenance');
    const [announcementBody, setAnnouncementBody] = useState('OmniBook will undergo routine database optimization on Sunday at 02:00 AM. Expect up to 15 minutes of degraded search performance.');
    const [announcementAudience, setAnnouncementAudience] = useState('Target Specific Roles');
    const [announcementPriority, setAnnouncementPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Urgent');
    const [inAppBanner, setInAppBanner] = useState(true);
    const [emailAlert, setEmailAlert] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['Clinic Admin', 'Front Desk']);
    const [roleInput, setRoleInput] = useState('');
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // In-App Toast notification system (Replaces native browser alert)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    };

    // Fetch support tickets and KPIs
    const fetchSupportData = useCallback(async (selectedTime = timeFilter, selectedCategory = activeFilter) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const [ticketsRes, kpisRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/superadmin/support/tickets', {
                    headers,
                    params: {
                        timeFilter: selectedTime,
                        issueType: selectedCategory === 'All Tickets' ? '' : selectedCategory
                    }
                }),
                axios.get('http://localhost:8080/api/v1/superadmin/support/kpis', {
                    headers,
                    params: { timeFilter: selectedTime }
                })
            ]);

            if (ticketsRes.data) {
                setTickets(ticketsRes.data);
            }
            if (kpisRes.data) {
                setKpis(kpisRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch superadmin support data:', err);
        } finally {
            setIsLoading(false);
        }
    }, [timeFilter, activeFilter]);

    useEffect(() => {
        fetchSupportData(timeFilter, activeFilter);
    }, [fetchSupportData, timeFilter, activeFilter]);

    // Handle ticket detail / action click
    const handleTicketClick = (ticket: SupportTicketItem) => {
        setSelectedTicket(ticket);
        setIsActionModalOpen(true);
    };

    // Update ticket status via API
    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedTicket) return;
        setIsUpdatingStatus(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.patch(
                `http://localhost:8080/api/v1/superadmin/support/tickets/${selectedTicket.id}/status`,
                { status: newStatus },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            if (response.data) {
                // Update in local state
                const updated = response.data;
                setTickets(prev => prev.map(t => (t.id === updated.id ? updated : t)));
                setSelectedTicket(updated);
                showToast(`Ticket ${updated.ticketNumber} marked as ${newStatus}. Update email dispatched to ${updated.adminAccount}!`, 'success');
                // Refresh KPIs
                fetchSupportData(timeFilter, activeFilter);
            }
        } catch (err) {
            console.error('Error updating ticket status:', err);
            showToast('Failed to update ticket status.', 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Handle Broadcast Announcement
    const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementTitle.trim() || !announcementBody.trim()) {
            showToast('Please provide an announcement title and message body.', 'error');
            return;
        }

        setIsBroadcasting(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post(
                'http://localhost:8080/api/v1/superadmin/support/announcements',
                {
                    title: announcementTitle.trim(),
                    messageBody: announcementBody.trim(),
                    audience: announcementAudience,
                    targetRoles: selectedRoles.join(', '),
                    priority: announcementPriority,
                    inAppBanner,
                    emailAlert
                },
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );

            setIsAnnouncementModalOpen(false);
            showToast('📢 System Announcement broadcasted successfully to all tenants!', 'success');
        } catch (err) {
            console.error('Failed to broadcast announcement:', err);
            showToast('Failed to broadcast announcement. Please try again.', 'error');
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && roleInput.trim() !== '') {
            e.preventDefault();
            if (!selectedRoles.includes(roleInput.trim())) {
                setSelectedRoles([...selectedRoles, roleInput.trim()]);
            }
            setRoleInput('');
        }
    };

    const handleRemoveRole = (roleToRemove: string) => {
        setSelectedRoles(selectedRoles.filter(role => role !== roleToRemove));
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen flex relative">
                <Sidebar />
                <TopNavigation />

                {/* Main Wrapper */}
                <div className="flex-1 flex flex-col ml-sidebar-width pt-16 min-h-screen relative">
                    {/* Content Canvas */}
                    <main className="flex-1 p-gutter max-w-container-max w-full mx-auto">
                        
                        {/* Dashboard Header */}
                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary mb-1">Enterprise Support &amp; Escalations</h2>
                                <p className="text-on-surface-variant font-body-md sm:font-body-lg text-sm sm:text-body-lg">
                                    Tier-3 technical assistance, service level agreement (SLA) tracking, and tenant diagnostic dispatch.
                                </p>
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-initial">
                                    <select 
                                        value={timeFilter}
                                        onChange={(e) => setTimeFilter(e.target.value)}
                                        className="appearance-none bg-surface border border-outline-variant pl-4 pr-10 py-2.5 rounded font-label-md text-label-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none cursor-pointer"
                                    >
                                        <option value="Last 30 Days">Last 30 Days</option>
                                        <option value="Last 7 Days">Last 7 Days</option>
                                        <option value="Last 90 Days">Last 90 Days</option>
                                        <option value="All Time">All Time</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>expand_more</span>
                                </div>
                                <button 
                                    onClick={() => setIsAnnouncementModalOpen(true)}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm cursor-pointer active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_alert</span>
                                    <span>Create System Announcement</span>
                                </button>
                            </div>
                        </div>

                        {/* Section 1: Dynamic Metric Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {/* Card 1: Open Tickets */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between shadow-xs">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">Open Tickets</p>
                                    <h3 className="text-4xl font-black text-primary">{kpis.openTickets}</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>inbox</span>
                                </div>
                            </div>
                            
                            {/* Card 2: Avg Resolution */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between shadow-xs">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">Avg Resolution</p>
                                    <h3 className="text-4xl font-black text-primary">{kpis.avgResolution}</h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                                </div>
                            </div>
                            
                            {/* Card 3: SLA Breaches */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between shadow-xs">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">SLA Breaches</p>
                                    <h3 className="text-4xl font-black text-primary">{kpis.slaBreaches}</h3>
                                </div>
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>shield</span>
                                </div>
                            </div>
                            
                            {/* Card 4: CSAT Score */}
                            <div className="bg-primary-container p-6 rounded-xl flex items-start justify-between shadow-xs">
                                <div>
                                    <p className="text-on-primary-container font-label-md text-label-md mb-2 uppercase tracking-wider">CSAT Score</p>
                                    <h3 className="text-4xl font-black text-white">{kpis.csatScore}</h3>
                                </div>
                                <div className="w-12 h-12 bg-secondary-container text-primary-container rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Ticket Ledger */}
                        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="font-headline-md text-headline-md text-primary font-bold">Active Escalation Queue</h3>
                                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg overflow-x-auto">
                                    {(['All Tickets', 'Critical (SLA)', 'Billing Issues', 'Integration Bugs'] as FilterType[]).map((tab) => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                                                activeFilter === tab 
                                                    ? 'bg-white text-primary shadow-sm' 
                                                    : 'text-on-surface-variant hover:text-primary'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-left">
                                    <thead className="bg-surface-container-low border-b border-outline-variant">
                                        <tr>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Ticket ID &amp; Clinic</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Admin Account</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Issue Type</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">SLA Countdown</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm">Fetching escalation tickets from database...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : tickets.length > 0 ? (
                                            tickets.map((ticket) => (
                                                <tr 
                                                    key={ticket.id} 
                                                    className="hover:bg-background transition-colors group cursor-pointer" 
                                                    onClick={() => handleTicketClick(ticket)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono-data text-mono-data text-secondary">{ticket.ticketNumber}</span>
                                                            <span className="font-bold text-primary">{ticket.organizationName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-body-md font-body-md text-on-surface-variant">{ticket.adminAccount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-body-md font-medium text-primary">{ticket.issueType}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {ticket.slaStatusClass === 'check_circle' ? (
                                                                <span className="material-symbols-outlined text-green-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                            ) : (
                                                                <span className={`w-2 h-2 rounded-full ${ticket.slaStatusClass}`}></span>
                                                            )}
                                                            <span className={`font-mono-data text-mono-data ${ticket.slaTextColor}`}>{ticket.slaTimeRemaining}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 ${ticket.statusBg} ${ticket.statusText} text-[11px] font-bold uppercase rounded-full`}>
                                                            {ticket.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer rounded-md hover:bg-slate-100"
                                                            title="Inspect Ticket & Actions"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTicketClick(ticket);
                                                            }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>open_in_new</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-body-md">
                                                    No active escalations found for this filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                                <span className="text-xs text-on-surface-variant font-medium">
                                    Showing {tickets.length} active escalations in database ({timeFilter})
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => fetchSupportData(timeFilter, activeFilter)}
                                        className="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-surface transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                                        <span>Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Contextual Note */}
                        <div className="mt-8 flex items-center gap-4 p-4 bg-secondary-fixed text-on-secondary-fixed rounded-lg border border-secondary-container">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                            <p className="text-sm font-medium">
                                Critical escalation protocols are currently active. Automatic dispatch to On-Call Engineers for any tickets exceeding 15 minutes in &quot;Urgent&quot; status.
                            </p>
                        </div>
                    </main>
                </div>
            </div>

            {/* =========================================================================
                TICKET DETAILS & ACTION MODAL (Replaces localhost alert)
                ========================================================================= */}
            {isActionModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                                        {selectedTicket.ticketNumber}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${selectedTicket.statusBg} ${selectedTicket.statusText}`}>
                                        {selectedTicket.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTicket.organizationName}</h3>
                            </div>
                            <button 
                                onClick={() => setIsActionModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Admin / Requester Account:</span>
                                    <a href={`mailto:${selectedTicket.adminAccount}`} className="font-semibold text-blue-600 hover:underline break-all">
                                        {selectedTicket.adminAccount}
                                    </a>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Issue Classification:</span>
                                    <span className="font-semibold text-slate-800">{selectedTicket.issueType}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">SLA Time Status:</span>
                                    <span className={`font-semibold ${selectedTicket.slaTextColor}`}>
                                        {selectedTicket.slaTimeRemaining}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">Priority Level:</span>
                                    <span className={`font-semibold ${selectedTicket.priority === 'Urgent' ? 'text-red-600' : 'text-slate-700'}`}>
                                        {selectedTicket.priority}
                                    </span>
                                </div>
                            </div>

                            {/* Ticket Message / Subject */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject / Inquiry</h4>
                                <div className="text-sm font-semibold text-slate-900 mb-2">
                                    {selectedTicket.subject || 'Support Ticket Details'}
                                </div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Message Description</h4>
                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {selectedTicket.message || 'No additional description provided.'}
                                </div>
                            </div>

                            {/* Action Buttons: Status Updates */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Update Escalation Status</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus || selectedTicket.status === 'Open'}
                                        onClick={() => handleStatusUpdate('Open')}
                                        className="py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                                    >
                                        Set Open
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus || selectedTicket.status === 'In Progress'}
                                        onClick={() => handleStatusUpdate('In Progress')}
                                        className="py-2 px-3 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus || selectedTicket.status === 'Urgent'}
                                        onClick={() => handleStatusUpdate('Urgent')}
                                        className="py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                                    >
                                        Escalate (Urgent)
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus || selectedTicket.status === 'Resolved'}
                                        onClick={() => handleStatusUpdate('Resolved')}
                                        className="py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                                    >
                                        Mark Resolved
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <button
                                type="button"
                                disabled={isUpdatingStatus || selectedTicket.status === 'Closed'}
                                onClick={() => handleStatusUpdate('Closed')}
                                className="text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors disabled:opacity-30"
                            >
                                Close Ticket Permanently
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsActionModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
                SYSTEM ANNOUNCEMENT MODAL
                ========================================================================= */}
            {isAnnouncementModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-outline-variant animate-scaleUp">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold">New System Announcement</h2>
                            <button 
                                onClick={() => setIsAnnouncementModalOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <form onSubmit={handleBroadcastAnnouncement}>
                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Section 1: Targeting Rules */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">Audience</label>
                                        <div className="relative">
                                            <select 
                                                value={announcementAudience}
                                                onChange={(e) => setAnnouncementAudience(e.target.value)}
                                                className="w-full appearance-none bg-surface border border-outline-variant px-4 py-3 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer"
                                            >
                                                <option value="Target Specific Roles">Target Specific Roles</option>
                                                <option value="All Users">All Users</option>
                                                <option value="All Tenants">All Tenants</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-on-surface-variant">expand_more</span>
                                        </div>
                                    </div>
                                    
                                    {announcementAudience === 'Target Specific Roles' && (
                                        <div>
                                            <label className="block text-sm font-bold text-primary mb-2">Select Roles</label>
                                            <div className="w-full bg-surface border border-outline-variant p-2 rounded-lg min-h-[48px] flex flex-wrap gap-2 items-center">
                                                {selectedRoles.map((role, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 bg-surface-variant text-on-surface px-3 py-1.5 rounded-full text-xs font-medium border border-outline-variant/30 shadow-sm">
                                                        {role}
                                                        <span 
                                                            className="material-symbols-outlined text-[14px] cursor-pointer hover:text-error"
                                                            onClick={() => handleRemoveRole(role)}
                                                        >close</span>
                                                    </div>
                                                ))}
                                                <input 
                                                    type="text" 
                                                    placeholder="Type role &amp; press Enter..." 
                                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant outline-none min-w-[120px]"
                                                    value={roleInput}
                                                    onChange={(e) => setRoleInput(e.target.value)}
                                                    onKeyDown={handleAddRole}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Section 2: Message Content */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">Announcement Title</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={announcementTitle}
                                            onChange={(e) => setAnnouncementTitle(e.target.value)}
                                            className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold text-primary"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-2">Message Body</label>
                                        <textarea 
                                            rows={4}
                                            required
                                            value={announcementBody}
                                            onChange={(e) => setAnnouncementBody(e.target.value)}
                                            className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Priority & Delivery Options */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-3">Priority Level</label>
                                        <div className="flex bg-surface-container rounded-lg p-1 gap-1">
                                            <button 
                                                type="button"
                                                onClick={() => setAnnouncementPriority('Low')}
                                                className={`flex-1 py-2 text-sm transition-colors rounded-md cursor-pointer ${announcementPriority === 'Low' ? 'font-bold bg-white text-primary shadow-sm border border-outline-variant/50' : 'font-medium text-on-surface-variant hover:text-primary hover:bg-white/50'}`}
                                            >Low</button>
                                            <button 
                                                type="button"
                                                onClick={() => setAnnouncementPriority('Normal')}
                                                className={`flex-1 py-2 text-sm transition-colors rounded-md cursor-pointer ${announcementPriority === 'Normal' ? 'font-bold bg-white text-primary shadow-sm border border-outline-variant/50' : 'font-medium text-on-surface-variant hover:text-primary hover:bg-white/50'}`}
                                            >Normal</button>
                                            <button 
                                                type="button"
                                                onClick={() => setAnnouncementPriority('Urgent')}
                                                className={`flex-1 py-2 text-sm transition-colors rounded-md cursor-pointer ${announcementPriority === 'Urgent' ? 'font-bold text-amber-900 bg-amber-100 border border-amber-200 shadow-sm' : 'font-medium text-on-surface-variant hover:text-amber-700 hover:bg-amber-50'}`}
                                            >Urgent</button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-primary mb-4">Delivery Method</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface cursor-pointer hover:bg-surface-variant/30 transition-colors"
                                                onClick={() => setInAppBanner(!inAppBanner)}
                                            >
                                                <span className="text-sm font-medium text-primary">In-App Top Banner</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${inAppBanner ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inAppBanner ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                            
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface cursor-pointer hover:bg-surface-variant/30 transition-colors"
                                                onClick={() => setEmailAlert(!emailAlert)}
                                            >
                                                <span className="text-sm font-medium text-primary">Dispatch via Email Alert</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${emailAlert ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailAlert ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsAnnouncementModalOpen(false)}
                                    className="px-6 py-2.5 rounded text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isBroadcasting}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md cursor-pointer disabled:opacity-60"
                                >
                                    {isBroadcasting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Broadcasting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">campaign</span>
                                            <span>Broadcast Announcement</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* In-App Toast Notification (Clean feedback replacing browser alert) */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 z-[200] animate-slideUp">
                    <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white border ${
                        toast.type === 'success' 
                            ? 'bg-slate-900 border-emerald-500/40' 
                            : toast.type === 'error'
                            ? 'bg-red-900 border-red-500/40'
                            : 'bg-blue-900 border-blue-500/40'
                    }`}>
                        <span className="material-symbols-outlined text-[18px] text-emerald-400">
                            {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
                        </span>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
