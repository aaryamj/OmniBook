import React, { useState } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

// Mock Data for the Escalation Queue
const mockTickets = [
    {
        id: '#TK-8821',
        clinicName: 'Lalitpur Wellness Center',
        adminAccount: 'admin@lalitpurwell.np',
        issueType: 'Integration Bugs',
        slaTimeRemaining: '42 mins remaining',
        slaStatusClass: 'bg-green-500',
        slaTextColor: 'text-on-surface',
        status: 'In Progress',
        statusBg: 'bg-blue-100',
        statusText: 'text-blue-700'
    },
    {
        id: '#TK-8819',
        clinicName: 'Kantipath Clinic',
        adminAccount: 'ops@kantipath.org',
        issueType: 'Critical (SLA)',
        slaTimeRemaining: '12 mins remaining',
        slaStatusClass: 'bg-yellow-500',
        slaTextColor: 'text-yellow-700 font-bold',
        status: 'Urgent',
        statusBg: 'bg-red-100',
        statusText: 'text-red-700'
    },
    {
        id: '#TK-8794',
        clinicName: 'Bir Hospital Engine',
        adminAccount: 'tech@bir.org',
        issueType: 'Integration Bugs',
        slaTimeRemaining: '4 hours remaining',
        slaStatusClass: 'bg-green-500',
        slaTextColor: 'text-on-surface',
        status: 'Open',
        statusBg: 'bg-gray-100',
        statusText: 'text-gray-700'
    },
    {
        id: '#TK-8750',
        clinicName: 'Mediciti Core',
        adminAccount: 'billing@mediciti.com',
        issueType: 'Billing Issues',
        slaTimeRemaining: 'Resolved',
        slaStatusClass: 'check_circle', // Indicates icon
        slaTextColor: 'text-green-700',
        status: 'Closed',
        statusBg: 'bg-green-100',
        statusText: 'text-green-700'
    }
];

type FilterType = 'All Tickets' | 'Critical (SLA)' | 'Billing Issues' | 'Integration Bugs';

export default function SuperAdminSupport() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('All Tickets');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [priority, setPriority] = useState<'Low' | 'Normal' | 'Urgent'>('Urgent');
    const [inAppBanner, setInAppBanner] = useState(true);
    const [emailAlert, setEmailAlert] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['Clinic Admin', 'Front Desk']);
    const [roleInput, setRoleInput] = useState('');

    const filteredTickets = mockTickets.filter(ticket => {
        if (activeFilter === 'All Tickets') return true;
        return ticket.issueType === activeFilter;
    });

    const handleActionClick = (ticketId: string) => {
        alert(`Opening details for ticket ${ticketId}...`);
    };

    const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && roleInput.trim() !== '') {
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
                <div className="flex-1 flex flex-col ml-[280px] pt-16 min-h-screen relative">
                    {/* Content Canvas */}
                    <main className="flex-1 p-gutter max-w-container-max w-full mx-auto">
                        
                        {/* Dashboard Header */}
                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
                            <div className="max-w-2xl">
                                <h2 className="font-headline-lg text-headline-lg text-primary mb-1">Enterprise Support & Escalations</h2>
                                <p className="text-on-surface-variant font-body-lg text-body-lg">Tier-3 technical assistance, service level agreement (SLA) tracking, and tenant diagnostic dispatch.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <select className="appearance-none bg-surface border border-outline-variant pl-4 pr-10 py-2.5 rounded font-label-md text-label-md focus:ring-2 focus:ring-secondary focus:border-transparent outline-none">
                                        <option>Last 30 Days</option>
                                        <option>Last 7 Days</option>
                                        <option>Custom Range</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 0" }}>expand_more</span>
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_alert</span>
                                    Create System Announcement
                                </button>
                            </div>
                        </div>

                        {/* Section 1: Metric Bento Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {/* Card 1 */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">Open Tickets</p>
                                    <h3 className="text-4xl font-black text-primary">7</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>inbox</span>
                                </div>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">Avg Resolution</p>
                                    <h3 className="text-4xl font-black text-primary">1.4h</h3>
                                </div>
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                                </div>
                            </div>
                            
                            {/* Card 3 */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex items-start justify-between">
                                <div>
                                    <p className="text-on-surface-variant font-label-md text-label-md mb-2">SLA Breaches</p>
                                    <h3 className="text-4xl font-black text-primary">0</h3>
                                </div>
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>shield</span>
                                </div>
                            </div>
                            
                            {/* Card 4 (Dark Theme Accent) */}
                            <div className="bg-primary-container p-6 rounded-xl flex items-start justify-between">
                                <div>
                                    <p className="text-on-primary-container font-label-md text-label-md mb-2 uppercase tracking-wider">CSAT Score</p>
                                    <h3 className="text-4xl font-black text-white">98.4%</h3>
                                </div>
                                <div className="w-12 h-12 bg-secondary-container text-primary-container rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Ticket Ledger */}
                        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="font-headline-md text-headline-md text-primary">Active Escalation Queue</h3>
                                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg overflow-x-auto">
                                    <button 
                                        onClick={() => setActiveFilter('All Tickets')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeFilter === 'All Tickets' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                                    >All Tickets</button>
                                    <button 
                                        onClick={() => setActiveFilter('Critical (SLA)')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeFilter === 'Critical (SLA)' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                                    >Critical (SLA)</button>
                                    <button 
                                        onClick={() => setActiveFilter('Billing Issues')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeFilter === 'Billing Issues' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                                    >Billing Issues</button>
                                    <button 
                                        onClick={() => setActiveFilter('Integration Bugs')}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md whitespace-nowrap transition-colors ${activeFilter === 'Integration Bugs' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
                                    >Integration Bugs</button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-container-low border-b border-outline-variant">
                                        <tr>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Ticket ID & Clinic</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Admin Account</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Issue Type</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">SLA Countdown</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Status</th>
                                            <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        {filteredTickets.length > 0 ? filteredTickets.map((ticket, index) => (
                                            <tr key={index} className="hover:bg-background transition-colors group cursor-pointer" onClick={() => handleActionClick(ticket.id)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono-data text-mono-data text-secondary">{ticket.id}</span>
                                                        <span className="font-bold text-primary">{ticket.clinicName}</span>
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
                                                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleActionClick(ticket.id);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>open_in_new</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-body-md">
                                                    No active escalations for this filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                                <span className="text-xs text-on-surface-variant font-medium">Showing {filteredTickets.length} of {mockTickets.length} active escalations</span>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-surface transition-colors">Previous</button>
                                    <button className="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-surface transition-colors">Next</button>
                                </div>
                            </div>
                        </div>

                        {/* Contextual Note (B2B SaaS pattern) */}
                        <div className="mt-8 flex items-center gap-4 p-4 bg-secondary-fixed text-on-secondary-fixed rounded-lg border border-secondary-container">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                            <p className="text-sm font-medium">
                                Critical escalation protocols are currently active. Automatic dispatch to On-Call Engineers for any tickets exceeding 15 minutes in "Urgent" status.
                            </p>
                        </div>
                    </main>
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    {/* Center Modal */}
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[40%] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold">New System Announcement</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Section 1: Targeting Rules */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2">Audience</label>
                                    <div className="relative">
                                        <select className="w-full appearance-none bg-surface border border-outline-variant px-4 py-3 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer">
                                            <option>Target Specific Roles</option>
                                            <option>All Users</option>
                                            <option>All Tenants</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-on-surface-variant">expand_more</span>
                                    </div>
                                </div>
                                
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
                                            placeholder="Type to add..." 
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant outline-none min-w-[100px]"
                                            value={roleInput}
                                            onChange={(e) => setRoleInput(e.target.value)}
                                            onKeyDown={handleAddRole}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Section 2: Message Content */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2">Announcement Title</label>
                                    <input 
                                        type="text" 
                                        defaultValue="Scheduled Infrastructure Maintenance"
                                        className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold text-primary"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2">Message Body</label>
                                    <textarea 
                                        rows={4}
                                        defaultValue="OmniBook will undergo routine database optimization on Sunday at 02:00 AM. Expect up to 15 minutes of degraded search performance."
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
                                            onClick={() => setPriority('Low')}
                                            className={`flex-1 py-2 text-sm transition-colors rounded-md ${priority === 'Low' ? 'font-bold bg-white text-primary shadow-sm border border-outline-variant/50' : 'font-medium text-on-surface-variant hover:text-primary hover:bg-white/50'}`}
                                        >Low</button>
                                        <button 
                                            onClick={() => setPriority('Normal')}
                                            className={`flex-1 py-2 text-sm transition-colors rounded-md ${priority === 'Normal' ? 'font-bold bg-white text-primary shadow-sm border border-outline-variant/50' : 'font-medium text-on-surface-variant hover:text-primary hover:bg-white/50'}`}
                                        >Normal</button>
                                        <button 
                                            onClick={() => setPriority('Urgent')}
                                            className={`flex-1 py-2 text-sm transition-colors rounded-md ${priority === 'Urgent' ? 'font-bold text-amber-900 bg-amber-100 border border-amber-200 shadow-sm' : 'font-medium text-on-surface-variant hover:text-amber-700 hover:bg-amber-50'}`}
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
                                            {/* Toggle Switch */}
                                            <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${inAppBanner ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${inAppBanner ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                            </div>
                                        </div>
                                        
                                        <div 
                                            className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface cursor-pointer hover:bg-surface-variant/30 transition-colors"
                                            onClick={() => setEmailAlert(!emailAlert)}
                                        >
                                            <span className="text-sm font-medium text-primary">Dispatch via Email Alert</span>
                                            {/* Toggle Switch */}
                                            <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${emailAlert ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
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
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 rounded text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    alert('Announcement Broadcasted Successfully!');
                                    setIsModalOpen(false);
                                }}
                                className="bg-primary text-on-primary px-6 py-2.5 rounded font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md"
                            >
                                <span className="material-symbols-outlined text-[18px]">campaign</span>
                                Broadcast Announcement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
