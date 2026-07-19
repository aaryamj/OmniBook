import React from 'react';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import SystemMetricsCards from './components/SystemMetricsCards';
import InfrastructureDiagnostics from './components/InfrastructureDiagnostics';

export default function SystemKPI() {
    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <Sidebar />
                <TopNavigation />
                
                {/* Main Content Area */}
                <main className="ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">
                        
                        {/* Page Heading */}
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="font-headline-lg text-headline-lg text-primary">System Performance Metrics</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Real-time telemetry and cluster orchestration monitor.</p>
                            </div>
                            <div>
                                <select className="bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors rounded-lg text-label-md font-label-md px-4 py-2 focus:ring-2 focus:ring-primary outline-none shadow-sm">
                                    <option>Last 24 Hours</option>
                                    <option>Last 7 Days</option>
                                    <option>This Month</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* KPI Cards */}
                        <SystemMetricsCards />
                        
                        {/* Diagnostic Panels & Charts */}
                        <InfrastructureDiagnostics />
                        
                    </div>
                </main>
            </div>
        </div>
    );
}
