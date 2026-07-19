import React, { useState, useRef, useEffect } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import PlatformOverviewCards from './components/PlatformOverviewCards';
import TenantManagementHub from './components/TenantManagementHub';
import TenantGrowthChart from './components/TenantGrowthChart';
import GlobalAuditLogs from './components/GlobalAuditLogs';

export default function TenantManagement() {
    const [timeFilter, setTimeFilter] = useState('Last 30 Days');
    const [showDateMenu, setShowDateMenu] = useState(false);
    
    // Export button states: 'idle' | 'exporting' | 'success'
    const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success'>('idle');
    
    const dateMenuRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close the dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dateMenuRef.current && !dateMenuRef.current.contains(event.target as Node)) {
                setShowDateMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle CSV Export
    const handleExport = () => {
        if (exportStatus !== 'idle') return;
        
        setExportStatus('exporting');
        
        // Simulate a 2 second network/generation delay
        setTimeout(() => {
            // Generate Mock CSV Content
            const csvContent = "Metric,Value\nTotal Clinics,42\nTotal MRR,245000\nTotal Patients,18450\nUptime,99.99%\nGenerated At," + new Date().toISOString();
            
            // Create a Blob and trigger a download using the browser API
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "OmniBook_Intelligence_Report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setExportStatus('success');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                setExportStatus('idle');
            }, 3000);
        }, 2000);
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">
                        
                        {/* Page Heading */}
                        <div className="flex justify-between items-end relative">
                            <div>
                                <h2 className="font-headline-lg text-headline-lg text-primary">Platform Overview</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Real-time surveillance across the OmniBook ecosystem.</p>
                            </div>
                            <div className="flex gap-3">
                                
                                {/* Date Filter Dropdown */}
                                <div className="relative" ref={dateMenuRef}>
                                    <button 
                                        onClick={() => setShowDateMenu(!showDateMenu)}
                                        className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        {timeFilter}
                                        <span className={`material-symbols-outlined text-[18px] transition-transform ${showDateMenu ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                                    </button>
                                    
                                    {showDateMenu && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50">
                                            <ul className="py-2">
                                                {['Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Year'].map(option => (
                                                    <li key={option} 
                                                        onClick={() => {
                                                            setTimeFilter(option);
                                                            setShowDateMenu(false);
                                                        }}
                                                        className={`px-4 py-2 text-body-md cursor-pointer transition-colors ${timeFilter === option ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}`}
                                                    >
                                                        {option}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Export Intelligence Button */}
                                <button 
                                    onClick={handleExport}
                                    className={`px-4 py-2 font-label-md text-label-md rounded flex items-center gap-2 transition-all shadow-lg min-w-[190px] justify-center ${
                                        exportStatus === 'idle' ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant' :
                                        exportStatus === 'exporting' ? 'bg-surface-container text-on-surface-variant cursor-wait' :
                                        'bg-green-600 text-white'
                                    }`}
                                >
                                    {exportStatus === 'idle' && (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">download</span>
                                            Export Intelligence
                                        </>
                                    )}
                                    {exportStatus === 'exporting' && (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                            Generating CSV...
                                        </>
                                    )}
                                    {exportStatus === 'success' && (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Downloaded!
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Global SaaS KPIs */}
                        <PlatformOverviewCards />
                        
                        {/* Tenant Management Hub Table */}
                        <TenantManagementHub />
                        
                        {/* Bottom Row Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-gutter pb-8">
                            {/* Left (70%): Tenant Growth Area Chart */}
                            <TenantGrowthChart />
                            
                            {/* Right (30%): Global Audit Logs */}
                            <GlobalAuditLogs />
                        </div>
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
