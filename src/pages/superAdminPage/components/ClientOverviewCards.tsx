import { useState, useEffect } from 'react';
import axios from 'axios';

interface ClientKPIData {
    totalClients: number;
    activeClients: number;
    suspendedClients: number;
    totalBookings: number;
    newClientsThisWeek: number;
}

export default function ClientOverviewCards({ timeFilter }: { timeFilter: string }) {
    const [kpi, setKpi] = useState<ClientKPIData>({
        totalClients: 0,
        activeClients: 0,
        suspendedClients: 0,
        totalBookings: 0,
        newClientsThisWeek: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8080/api/v1/superadmin/clients/kpis?timeFilter=${encodeURIComponent(timeFilter)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setKpi(res.data);
            } catch (error) {
                console.error("Failed to fetch client KPIs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKPIs();
        const interval = setInterval(fetchKPIs, 30000);
        return () => clearInterval(interval);
    }, [timeFilter]);

    const activePercentage = kpi.totalClients > 0 
        ? Math.round((kpi.activeClients / kpi.totalClients) * 100) 
        : 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1: Total Registered Clients */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-lg">groups</span>
                    <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Live Data</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Total Registered Clients</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface tracking-tighter">
                    {loading ? '...' : kpi.totalClients.toLocaleString()}
                </p>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">
                    +{kpi.newClientsThisWeek} registered this week
                </p>
            </div>
            
            {/* KPI 2: Active Clients */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-emerald-50 text-emerald-600 rounded-lg">verified_user</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {activePercentage}% Active Rate
                    </span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Active Clients</h3>
                <p className="font-headline-lg text-headline-lg text-emerald-600 tracking-tighter">
                    {loading ? '...' : kpi.activeClients.toLocaleString()}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1">
                    In good standing across all tenants
                </p>
            </div>
            
            {/* KPI 3: Suspended Accounts */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200">
                <div className="flex justify-between items-start mb-4">
                    <span className="material-symbols-outlined p-2 bg-rose-50 text-rose-600 rounded-lg">person_off</span>
                    {kpi.suspendedClients > 0 && (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Restricted</span>
                    )}
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Suspended Accounts</h3>
                <p className="font-headline-lg text-headline-lg text-on-surface tracking-tighter">
                    {loading ? '...' : kpi.suspendedClients.toLocaleString()}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1">
                    {kpi.suspendedClients === 0 ? "Zero accounts currently suspended" : "Blocked from booking appointments"}
                </p>
            </div>
            
            {/* KPI 4: Total Bookings / Consultations Across Ecosystem */}
            <div className="bg-primary-container p-gutter rounded-xl border border-on-primary-fixed-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-surface-container-lowest opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-[120px]">event_available</span>
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-2 bg-secondary-container rounded-lg">
                        <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                            event_available
                        </span>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-secondary-container animate-ping"></span>
                </div>
                <p className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest mb-1 relative z-10">Total Bookings (Ecosystem)</p>
                <h3 className="font-headline-lg text-headline-lg text-surface-container-lowest font-mono-data relative z-10">
                    {loading ? '...' : kpi.totalBookings.toLocaleString()}
                </h3>
            </div>
        </div>
    );
}
