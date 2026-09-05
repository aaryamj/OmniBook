import React, { useState } from 'react';
import '../superAdminPage/superAdmin.css';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';

import axios from 'axios';

interface AdminAppointmentDTO {
    id: string;
    patientName: string;
    initials: string;
    date: string;
    time: string;
    providerName: string;
    department: string;
    status: string;
    paymentStatus: string;
    bgColor?: string;
    statusColor?: string;
    paymentColor?: string;
    payment?: string;
}

const dateRangeList = ['Oct 24 - Oct 31, 2026', 'Nov 1 - Nov 7, 2026', 'Nov 8 - Nov 14, 2026'];

export default function AllAppointments() {
    const [appointments, setAppointments] = React.useState<AdminAppointmentDTO[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [providersList, setProvidersList] = React.useState<string[]>(['All Providers']);
    
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    
    const [statusFilter, setStatusFilter] = useState('All');
    const [providerFilter, setProviderFilter] = useState('All Providers');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
    const [viewDetailsApp, setViewDetailsApp] = useState<any>(null);
    const [rescheduleApp, setRescheduleApp] = useState<any>(null);

    // New Appointment Modal State
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [newAppForm, setNewAppForm] = useState({
        patientName: '',
        date: '',
        time: '',
        provider: 'Dr. Adler',
        department: 'Cardiology'
    });

    const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const mappedData = response.data.map((app: any) => {
                let bgColor = 'bg-slate-100 text-slate-600';
                if (app.initials) {
                    const charCode = app.initials.charCodeAt(0);
                    if (charCode % 3 === 0) bgColor = 'bg-blue-100 text-blue-600';
                    else if (charCode % 3 === 1) bgColor = 'bg-amber-100 text-amber-600';
                    else bgColor = 'bg-purple-100 text-purple-600';
                }

                let statusColor = 'bg-slate-50 text-slate-700 border-slate-100';
                if (app.status === 'SCHEDULED' || app.status === 'Upcoming') statusColor = 'bg-blue-50 text-blue-700 border-blue-100';
                if (app.status === 'CHECKED_IN' || app.status === 'IN_CONSULTATION') statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
                if (app.status === 'COMPLETED') statusColor = 'bg-green-50 text-green-700 border-green-100';
                if (app.status === 'CANCELLED') statusColor = 'bg-red-50 text-red-700 border-red-100';

                let paymentColor = 'bg-slate-100 text-slate-600 border-slate-200';
                if (app.paymentStatus === 'SUCCESS' || app.paymentStatus === 'PAID') paymentColor = 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]';

                return {
                    ...app,
                    bgColor,
                    statusColor,
                    payment: app.paymentStatus,
                    paymentColor
                };
            });
            
            setAppointments(mappedData);
            
            // Extract unique providers for filter
            const uniqueProviders = new Set<string>();
            mappedData.forEach((app: any) => {
                if (app.providerName) uniqueProviders.add(app.providerName);
            });
            setProvidersList(['All Providers', ...Array.from(uniqueProviders)]);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchAppointments();
    }, []);

    const parseAppDate = (dateStr: string) => {
        return dateStr; 
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter || (statusFilter === 'Upcoming' && app.status === 'SCHEDULED'); 
        const exactMatchStatus = statusFilter === 'All' || (statusFilter === 'Upcoming' ? ['Upcoming', 'SCHEDULED', 'Rescheduled'].includes(app.status) : app.status.toUpperCase() === statusFilter.toUpperCase());
        const matchesProvider = providerFilter === 'All Providers' || app.providerName === providerFilter;
        const matchesSearch = app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.includes(searchQuery);
        const matchesDate = !selectedDate || parseAppDate(app.date) === selectedDate;
        return exactMatchStatus && matchesProvider && matchesSearch && matchesDate;
    });

    const getStatusTabClass = (status: string) => {
        return statusFilter === status 
            ? "px-3 py-1 bg-primary text-white rounded font-label-md text-label-md whitespace-nowrap transition-colors"
            : "px-3 py-1 hover:bg-surface-container text-on-surface-variant rounded font-label-md text-label-md whitespace-nowrap transition-colors";
    };

    // --- Calendar Logic ---
    const calendarDate = selectedDate ? new Date(selectedDate) : new Date();
    const currentYear = calendarDate.getFullYear();
    const currentMonth = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString('default', { month: 'long' });

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getAppsForDay = (day: number) => {
        return filteredAppointments.filter(app => {
            const [y, m, d] = app.date.split('-');
            return parseInt(d, 10) === day && (parseInt(m, 10) - 1) === currentMonth && parseInt(y, 10) === currentYear;
        });
    };

    // --- Action Handlers ---
    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
              const token = localStorage.getItem('token');
              const payload = {
                  ...newAppForm,
                  providerName: newAppForm.provider
              };
              await axios.post('http://localhost:8080/api/v1/admin/appointments', payload, {
                  headers: { Authorization: `Bearer ${token}` }
              });
            setIsNewAppointmentModalOpen(false);
            setNewAppForm({ patientName: '', date: '', time: '', provider: 'Dr. Adler', department: 'Cardiology' });
            fetchAppointments();
        } catch (error) {
            console.error("Failed to add walk-in appointment", error);
            alert("Failed to create appointment.");
        }
    };

    const handleRescheduleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleApp) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/api/v1/admin/appointments/${rescheduleApp.id}/reschedule?newDate=${rescheduleForm.date}&newTime=${rescheduleForm.time}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRescheduleApp(null);
            fetchAppointments();
        } catch (error) {
            console.error("Failed to reschedule appointment", error);
            alert("Failed to reschedule appointment.");
        }
    };

    const handleCancelAppointment = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/admin/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActiveActionMenuId(null);
            fetchAppointments();
        } catch (error) {
            console.error("Failed to cancel appointment", error);
            alert("Failed to cancel appointment.");
        }
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <AdminSidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen flex flex-col">
                    <div className="max-w-container-max mx-auto w-full flex-1 flex flex-col">
                        
                        {/* View Controls & Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-primary tracking-tighter">Appointment Roster</h2>
                                <p className="text-on-surface-variant font-body-md text-body-md mt-1">Real-time scheduling and operational oversight.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                <div className="bg-primary-container p-1 rounded-lg flex items-center flex-1 sm:flex-initial justify-center">
                                    <button 
                                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 font-label-md text-label-md rounded flex items-center justify-center gap-2 transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-on-primary-fixed-variant text-white shadow-sm' : 'text-on-primary-container hover:text-white'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <span className="material-symbols-outlined text-sm">list</span>
                                        List View
                                    </button>
                                    <button 
                                        className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 font-label-md text-label-md rounded flex items-center justify-center gap-2 transition-colors cursor-pointer ${viewMode === 'calendar' ? 'bg-on-primary-fixed-variant text-white shadow-sm' : 'text-on-primary-container hover:text-white'}`}
                                        onClick={() => setViewMode('calendar')}
                                    >
                                        <span className="material-symbols-outlined text-sm">calendar_view_month</span>
                                        Calendar View
                                    </button>
                                </div>
                                <button 
                                    className="w-full sm:w-auto bg-[#0EA5E9] text-white px-6 py-2.5 font-bold rounded flex items-center justify-center gap-2 shadow-lg shadow-sky-400/30 hover:brightness-105 transition-all cursor-pointer"
                                    onClick={() => setIsNewAppointmentModalOpen(true)}
                                >
                                    <span className="material-symbols-outlined">add</span>
                                    New Appointment
                                </button>
                            </div>
                        </div>

                        {/* Master Filter Bar */}
                        <div className="bg-white border border-outline-variant p-2 flex flex-wrap items-center gap-3 shadow-sm mb-6 rounded z-20">
                            {/* Date Picker */}
                            <div className="relative border-r border-outline-variant pr-4 min-w-[180px] flex items-center">
                                <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">calendar_today</span>
                                <input 
                                    type="date"
                                    className="bg-transparent border-none focus:ring-0 font-label-md text-label-md text-on-surface outline-none cursor-pointer w-full p-1 hover:bg-surface-container rounded transition-colors"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            {/* Provider Dropdown */}
                            <div className="relative border-r border-outline-variant px-4 min-w-[180px]">
                                <div 
                                    className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded transition-colors"
                                    onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                                >
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">medical_information</span>
                                    <span className="font-label-md text-label-md text-on-surface">{providerFilter}</span>
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm ml-auto">arrow_drop_down</span>
                                </div>
                                {isProviderDropdownOpen && (
                                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-outline-variant rounded shadow-lg py-1 z-30">
                                        {providersList.map(provider => (
                                            <div 
                                                key={provider} 
                                                className="px-4 py-2 hover:bg-surface-container cursor-pointer font-label-md text-label-md text-on-surface transition-colors"
                                                onClick={() => { setProviderFilter(provider); setIsProviderDropdownOpen(false); }}
                                            >
                                                {provider}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Filters */}
                            <div className="flex items-center gap-1.5 px-4 overflow-x-auto no-scrollbar border-r border-outline-variant py-1">
                                <button className={getStatusTabClass('All')} onClick={() => setStatusFilter('All')}>All</button>
                                <button className={getStatusTabClass('Upcoming')} onClick={() => setStatusFilter('Upcoming')}>Upcoming</button>
                                <button className={getStatusTabClass('Completed')} onClick={() => setStatusFilter('Completed')}>Completed</button>
                                <button className={getStatusTabClass('Cancelled')} onClick={() => setStatusFilter('Cancelled')}>Cancelled</button>
                            </div>

                            {/* Search */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-1.5">
                                <span className="material-symbols-outlined text-on-surface-variant">search</span>
                                <input 
                                    className="w-full bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                                    placeholder="Search by Patient Name or ID..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Content Area - Conditional based on viewMode */}
                        {viewMode === 'list' ? (
                            <div className="bg-white border border-outline-variant flex-1 flex flex-col shadow-sm overflow-hidden mb-6 rounded z-10" onClick={() => { setIsProviderDropdownOpen(false); setActiveActionMenuId(null); }}>
                                <div className="overflow-x-auto custom-scrollbar flex-1">
                                    <table className="w-full text-left border-collapse min-w-[1000px]">
                                        <thead className="bg-[#F1F5F9] border-b border-outline-variant sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date &amp; Time</th>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Patient Details</th>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Assigned Provider</th>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Operational Status</th>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Payment Status</th>
                                                <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F1F5F9]">
                                            {filteredAppointments.length > 0 ? (
                                                filteredAppointments.map((app) => (
                                                    <tr key={app.id} className={`hover:bg-background transition-colors group ${app.status === 'Completed' ? 'opacity-60' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono-data text-on-surface font-semibold">{app.date}</div>
                                                            <div className="text-xs text-on-surface-variant mt-0.5">{app.time}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${app.bgColor}`}>{app.initials}</div>
                                                                <div>
                                                                    <div className="font-body-md text-body-md font-bold text-on-surface">{app.patientName}</div>
                                                                    <div className="text-[10px] text-on-surface-variant uppercase font-mono-data">ID: {app.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-body-md text-body-md text-on-surface">{app.providerName}</div>
                                                            <div className="text-[11px] font-semibold text-[#00668a] uppercase">{app.department}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${app.paymentColor}`}>
                                                                {app.payment}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right relative">
                                                            <button 
                                                                className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveActionMenuId(activeActionMenuId === app.id ? null : app.id);
                                                                }}
                                                            >
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                            {/* Action Dropdown Menu */}
                                                            {activeActionMenuId === app.id && (
                                                                <div className="absolute right-6 top-10 w-48 bg-white border border-outline-variant shadow-lg rounded py-1 z-30 text-left">
                                                                    <button 
                                                                        className="w-full text-left px-4 py-2 hover:bg-surface-container text-sm font-label-md text-on-surface"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setViewDetailsApp(app);
                                                                            setActiveActionMenuId(null);
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                    <button 
                                                                        className="w-full text-left px-4 py-2 hover:bg-surface-container text-sm font-label-md text-on-surface"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRescheduleApp(app);
                                                                            setRescheduleForm({ date: app.date, time: app.time });
                                                                            setActiveActionMenuId(null);
                                                                        }}
                                                                    >
                                                                        Reschedule
                                                                    </button>
                                                                    {app.status !== 'Cancelled' && (
                                                                        <button 
                                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-label-md text-red-600"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCancelAppointment(app.id);
                                                                            }}
                                                                        >
                                                                            Cancel Appointment
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                                                        No appointments found matching the current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination */}
                                <div className="bg-white px-6 py-4 border-t border-outline-variant flex items-center justify-between mt-auto">
                                    <div className="text-xs text-on-surface-variant">
                                        Showing <span className="font-bold text-primary">{filteredAppointments.length > 0 ? 1 : 0} - {filteredAppointments.length}</span> of <span className="font-bold text-primary">{appointments.length}</span> entries
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded transition-colors border border-outline-variant/30 flex items-center gap-1 opacity-50 cursor-not-allowed">
                                            <span className="material-symbols-outlined text-sm">chevron_left</span>
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
                                        </div>
                                        <button className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded transition-colors border border-outline-variant/30 flex items-center gap-1 opacity-50 cursor-not-allowed">
                                            Next
                                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-outline-variant flex-1 flex flex-col shadow-sm overflow-hidden mb-6 rounded z-10" onClick={() => setIsProviderDropdownOpen(false)}>
                                {/* Calendar Header */}
                                <div className="bg-[#F1F5F9] px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                                    <h3 className="font-bold text-on-surface text-lg">{monthName} {currentYear}</h3>
                                    <div className="flex gap-2">
                                        <button className="p-1 hover:bg-surface-container rounded border border-outline-variant transition-colors" title="Previous Month">
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button className="p-1 hover:bg-surface-container rounded border border-outline-variant transition-colors" title="Next Month">
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Calendar Grid Header (Days of week) */}
                                <div className="grid grid-cols-7 border-b border-outline-variant">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="px-4 py-3 text-center font-bold text-on-surface-variant text-xs uppercase tracking-wide">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,_1fr)]">
                                    {blanks.map(blank => (
                                        <div key={`blank-${blank}`} className="border-r border-b border-outline-variant bg-surface-container-lowest/30 p-2"></div>
                                    ))}
                                    {daysArray.map(day => {
                                        const dailyApps = getAppsForDay(day);
                                        return (
                                            <div key={day} className="border-r border-b border-outline-variant p-2 flex flex-col hover:bg-background transition-colors min-h-[120px]">
                                                <div className="font-bold text-on-surface-variant text-sm mb-2 text-right">{day}</div>
                                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
                                                    {dailyApps.map(app => (
                                                        <div key={app.id} className={`p-1.5 rounded border border-l-4 text-xs shadow-sm flex flex-col gap-1 bg-white cursor-pointer hover:shadow-md transition-shadow ${app.status === 'Completed' ? 'border-l-green-500 opacity-60' : app.status === 'Cancelled' ? 'border-l-red-500' : app.status === 'Rescheduled' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                                                            <div className="font-bold truncate text-on-surface">{app.time}</div>
                                                            <div className="truncate font-semibold text-primary">{app.patientName}</div>
                                                            <div className="text-[10px] text-on-surface-variant truncate">{app.providerName}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>
                </main>

                {/* New Appointment Modal Overlay */}
                {isNewAppointmentModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-[#F8FAFC]">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">New Appointment</h3>
                                <button 
                                    className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                                    onClick={() => setIsNewAppointmentModalOpen(false)}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form className="p-6 flex flex-col gap-4" onSubmit={handleAddAppointment}>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">Patient Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={newAppForm.patientName}
                                        onChange={(e) => setNewAppForm({...newAppForm, patientName: e.target.value})}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">Date</label>
                                        <input 
                                            required
                                            type="date" 
                                            className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            value={newAppForm.date}
                                            onChange={(e) => setNewAppForm({...newAppForm, date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">Time</label>
                                        <input 
                                            required
                                            type="time" 
                                            className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            value={newAppForm.time}
                                            onChange={(e) => setNewAppForm({...newAppForm, time: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">Provider</label>
                                    <select 
                                        className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                                        value={newAppForm.provider}
                                        onChange={(e) => setNewAppForm({...newAppForm, provider: e.target.value})}
                                    >
                                        <option value="Dr. Adler">Dr. Adler</option>
                                        <option value="Dr. Thorne">Dr. Thorne</option>
                                        <option value="Dr. Gupta">Dr. Gupta</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">Department</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        value={newAppForm.department}
                                        onChange={(e) => setNewAppForm({...newAppForm, department: e.target.value})}
                                        placeholder="e.g. Cardiology"
                                    />
                                </div>
                                
                                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                                    <button 
                                        type="button"
                                        className="px-4 py-2 rounded text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                                        onClick={() => setIsNewAppointmentModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2 rounded bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:brightness-110 transition-all"
                                    >
                                        Create Appointment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* View Details Modal Overlay */}
                {viewDetailsApp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-[#F8FAFC]">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Appointment Details</h3>
                                <button 
                                    className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                                    onClick={() => setViewDetailsApp(null)}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 flex flex-col gap-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${viewDetailsApp.bgColor}`}>
                                        {viewDetailsApp.initials}
                                    </div>
                                    <div>
                                        <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{viewDetailsApp.patientName}</div>
                                        <div className="text-xs text-on-surface-variant uppercase font-mono-data">ID: {viewDetailsApp.id}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-t border-b border-outline-variant py-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Date</div>
                                        <div className="font-body-md text-on-surface font-semibold">{viewDetailsApp.date}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Time</div>
                                        <div className="font-body-md text-on-surface font-semibold">{viewDetailsApp.time}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Provider</div>
                                        <div className="font-body-md text-on-surface font-semibold">{viewDetailsApp.providerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Department</div>
                                        <div className="font-body-md text-[#00668a] font-bold">{viewDetailsApp.department}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">Status</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${viewDetailsApp.statusColor}`}>
                                            {viewDetailsApp.status}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1 text-right">Payment</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${viewDetailsApp.paymentColor}`}>
                                            {viewDetailsApp.payment}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant flex justify-end">
                                <button 
                                    className="px-6 py-2 rounded bg-primary text-white text-sm font-bold shadow hover:brightness-110 transition-all"
                                    onClick={() => setViewDetailsApp(null)}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reschedule Modal Overlay */}
                {rescheduleApp && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-[#F8FAFC]">
                                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Reschedule Appointment</h3>
                                <button 
                                    className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                                    onClick={() => setRescheduleApp(null)}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form className="p-6 flex flex-col gap-4" onSubmit={handleRescheduleSubmit}>
                                <div className="bg-surface-container-lowest border border-outline-variant rounded p-3 mb-2 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${rescheduleApp.bgColor}`}>
                                        {rescheduleApp.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-on-surface text-sm">{rescheduleApp.patientName}</div>
                                        <div className="text-xs text-on-surface-variant">with {rescheduleApp.providerName}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">New Date</label>
                                        <input 
                                            required
                                            type="date" 
                                            className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            value={rescheduleForm.date}
                                            onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wide">New Time</label>
                                        <input 
                                            required
                                            type="time" 
                                            className="w-full border border-outline-variant rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            value={rescheduleForm.time}
                                            onChange={(e) => setRescheduleForm({...rescheduleForm, time: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-outline-variant">
                                    <button 
                                        type="button"
                                        className="px-4 py-2 rounded text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                                        onClick={() => setRescheduleApp(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2 rounded bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:brightness-110 transition-all"
                                    >
                                        Confirm Reschedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
