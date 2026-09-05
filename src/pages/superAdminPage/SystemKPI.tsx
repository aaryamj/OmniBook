import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import SystemMetricsCards from './components/SystemMetricsCards';
import InfrastructureDiagnostics from './components/InfrastructureDiagnostics';

export default function SystemKPI() {
    const [kpiData, setKpiData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/api/v1/superadmin/system-kpi', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setKpiData(response.data);
            } catch (error) {
                console.error("Failed to fetch system KPI data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);
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
                                <h2 className="text-2xl sm:text-headline-lg font-headline-lg text-primary">System Performance Metrics</h2>
                                <p className="font-body-md text-body-md text-on-surface-variant">Real-time telemetry and cluster orchestration monitor.</p>
                            </div>
                            <div className="w-full sm:w-auto">
                                <select className="w-full sm:w-auto bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors rounded-lg text-label-md font-label-md px-4 py-2 focus:ring-2 focus:ring-primary outline-none shadow-sm">
                                    <option>Last 24 Hours</option>
                                    <option>Last 7 Days</option>
                                    <option>This Month</option>
                                </select>
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
