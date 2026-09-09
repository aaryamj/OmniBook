import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import SystemMetricsCards from './components/SystemMetricsCards';
import InfrastructureDiagnostics from './components/InfrastructureDiagnostics';

export default function SystemKPI() {
    const [kpiData, setKpiData] = useState<any>(null);
    const [timeRange, setTimeRange] = useState('Real-Time (Live)');
    const [showMenu, setShowMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const timeOptions = [
        { label: 'Real-Time (Live)', icon: 'sensors', desc: '3-second live streaming' },
        { label: 'Last 24 Hours', icon: 'schedule', desc: 'Hourly aggregated metrics' },
        { label: 'Last 7 Days', icon: 'date_range', desc: 'Daily performance trends' },
        { label: 'This Month', icon: 'calendar_month', desc: '30-day cluster analytics' },
        { label: 'All Time', icon: 'all_inclusive', desc: 'Platform lifetime telemetry' },
    ];

    // Handle outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async (rangeToFetch: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/superadmin/system-kpi', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { timeRange: rangeToFetch }
            });
            setKpiData(response.data);
        } catch (error) {
            console.error("Failed to fetch system KPI data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-fetch when timeRange changes and configure interval
    useEffect(() => {
        setIsLoading(true);
        fetchData(timeRange);

        // If Real-Time (Live), poll every 3 seconds; otherwise poll every 15 seconds
        const intervalMs = timeRange === 'Real-Time (Live)' ? 3000 : 15000;
        const interval = setInterval(() => {
            fetchData(timeRange);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [timeRange]);

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">
                        
                        {/* Page Heading */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary">System Performance Metrics</h2>
                                    {timeRange === 'Real-Time (Live)' ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                            LIVE
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                            <span className="material-symbols-outlined text-[13px]">history</span>
                                            HISTORICAL
                                        </span>
                                    )}
                                </div>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    {timeRange === 'Real-Time (Live)' 
                                        ? 'Real-time telemetry and cluster orchestration monitor (updates every 3s).'
                                        : `Historical telemetry aggregated for ${timeRange.toLowerCase()}.`}
                                </p>
                            </div>
                            
                            {/* Dynamic Time Range Dropdown */}
                            <div className="w-full sm:w-auto relative" ref={menuRef}>
                                <button
                                    type="button"
                                    id="system-kpi-time-dropdown-btn"
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors rounded-lg text-label-md font-label-md px-4 py-2 flex items-center justify-between gap-3 focus:ring-2 focus:ring-primary outline-none shadow-sm min-w-[200px]"
                                >
                                    <div className="flex items-center gap-2 text-primary font-bold">
                                        <span className="material-symbols-outlined text-[18px]">
                                            {timeOptions.find(o => o.label === timeRange)?.icon || 'calendar_today'}
                                        </span>
                                        <span>{timeRange}</span>
                                    </div>
                                    <span className={`material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`}>
                                        arrow_drop_down
                                    </span>
                                </button>

                                {showMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="p-2 border-b border-surface-container-low bg-surface-container-low/40">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-2">Telemetry Interval</span>
                                        </div>
                                        <ul className="py-1">
                                            {timeOptions.map(option => (
                                                <li
                                                    key={option.label}
                                                    onClick={() => {
                                                        setTimeRange(option.label);
                                                        setShowMenu(false);
                                                    }}
                                                    className={`px-3 py-2.5 cursor-pointer transition-colors flex items-start gap-3 ${timeRange === option.label ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}`}
                                                >
                                                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${timeRange === option.label ? 'text-primary' : 'text-on-surface-variant'}`}>
                                                        {option.icon}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-body-md">{option.label}</span>
                                                            {timeRange === option.label && (
                                                                <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-on-surface-variant font-normal block">{option.desc}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* KPI Cards */}
                        <SystemMetricsCards data={kpiData} />
                        
                        {/* Diagnostic Panels & Charts */}
                        <InfrastructureDiagnostics data={kpiData} />
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
