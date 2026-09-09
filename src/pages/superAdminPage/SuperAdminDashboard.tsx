import React, { useState, useRef, useEffect } from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import DashboardOverviewCards from './components/DashboardOverviewCards';
import PlatformRevenueChart from './components/PlatformRevenueChart';
import RecentOnboardingActivity from './components/RecentOnboardingActivity';

export default function SuperAdminDashboard() {
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [showDateMenu, setShowDateMenu] = useState(false);
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

    const timeOptions = ['Today', 'Last 7 days', 'Last 30 days', 'This Quarter', 'This Year', 'All Time'];

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">
                        
                        {/* Page Heading & Time Dropdown */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative">
                            <div>
                                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">Welcome back, System Admin</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Here is what is happening across the OmniBook platform {timeFilter === 'All Time' ? 'across all time' : timeFilter.toLowerCase()}.</p>
                            </div>
                            
                            {/* Date Filter Dropdown */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative" ref={dateMenuRef}>
                                    <button 
                                        type="button"
                                        id="admin-dashboard-time-dropdown-btn"
                                        onClick={() => setShowDateMenu(!showDateMenu)}
                                        className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md rounded flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        <span>{timeFilter}</span>
                                        <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${showDateMenu ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                                    </button>
                                    
                                    {showDateMenu && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                            <ul className="py-2">
                                                {timeOptions.map(option => (
                                                    <li 
                                                        key={option} 
                                                        onClick={() => {
                                                            setTimeFilter(option);
                                                            setShowDateMenu(false);
                                                        }}
                                                        className={`px-4 py-2 text-body-md cursor-pointer transition-colors flex items-center justify-between ${timeFilter === option ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-low'}`}
                                                    >
                                                        <span>{option}</span>
                                                        {timeFilter === option && (
                                                            <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* SECTION 1: KPI GRID */}
                        <DashboardOverviewCards timeFilter={timeFilter} />
                        
                        {/* SECTION 2: CHARTS */}
                        <PlatformRevenueChart timeFilter={timeFilter} />
                        
                        {/* SECTION 3: BOTTOM ROW */}
                        <RecentOnboardingActivity timeFilter={timeFilter} />
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
