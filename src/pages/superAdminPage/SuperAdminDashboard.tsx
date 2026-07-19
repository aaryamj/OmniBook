import React from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import DashboardOverviewCards from './components/DashboardOverviewCards';
import PlatformRevenueChart from './components/PlatformRevenueChart';
import RecentOnboardingActivity from './components/RecentOnboardingActivity';

export default function SuperAdminDashboard() {
    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">
                        
                        {/* Page Heading */}
                        <div className="flex flex-col space-y-1">
                            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Welcome back, System Admin</h1>
                            <p className="font-body-md text-body-md text-on-surface-variant">Here is what is happening across the OmniBook platform today.</p>
                        </div>
                        
                        {/* SECTION 1: KPI GRID */}
                        <DashboardOverviewCards />
                        
                        {/* SECTION 2: CHARTS */}
                        <PlatformRevenueChart />
                        
                        {/* SECTION 3: BOTTOM ROW */}
                        <RecentOnboardingActivity />
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
