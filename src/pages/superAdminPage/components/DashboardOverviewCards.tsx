import { useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
    id: number;
    status: string;
    createdAt: string;
}

export default function DashboardOverviewCards({ timeFilter = 'All Time' }: { timeFilter?: string }) {
    const [activeCount, setActiveCount] = useState(0);
    const [newThisWeek, setNewThisWeek] = useState(0);
    const [mrr, setMrr] = useState(0);
    const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);
    const [commissionRevenue, setCommissionRevenue] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [commissionRate, setCommissionRate] = useState(10.0);
    const [activeSubscribers, setActiveSubscribers] = useState(0);
    const [expiringSoonCount, setExpiringSoonCount] = useState(0);
    const [pendingExtensionsCount, setPendingExtensionsCount] = useState(0);
    const [totalPatientFootfall, setTotalPatientFootfall] = useState(0);
    const [uptime, setUptime] = useState(99.99);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/v1/superadmin/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: { timeFilter: timeFilter }
                });
                
                const data = res.data;
                setActiveCount(data.activeClinics || 0);
                setNewThisWeek(data.newClinicsThisWeek || 0);
                setMrr(data.subscriptionMrr || data.mrr || 0);
                setSubscriptionRevenue(data.subscriptionRevenue || 0);
                setCommissionRevenue(data.appointmentCommissionRevenue || 0);
                setTotalRevenue(data.totalPlatformRevenue || ((data.subscriptionRevenue || 0) + (data.appointmentCommissionRevenue || 0)));
                setCommissionRate(data.commissionRate || 10.0);
                setActiveSubscribers(data.activeSubscribers || data.activeClinics || 0);
                setExpiringSoonCount(data.expiringSoonCount || 0);
                setPendingExtensionsCount(data.pendingExtensionsCount || 0);
                setTotalPatientFootfall(data.totalPatientFootfall || 0);
                setUptime(data.systemUptime || 99.99);
                
            } catch (error) {
                console.error("Failed to fetch dashboard metrics", error);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [timeFilter]);

    return (
        <div className="space-y-6">
            {/* PRIMARY FINANCIAL STREAMS DECK */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Subscription MRR */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                Normalized
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                {timeFilter}
                            </span>
                        </div>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Subscription MRR</h3>
                    <p className="font-headline-lg text-headline-lg text-primary font-black tracking-tight">रू {mrr.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                        <span className="font-medium text-emerald-600 font-bold">{activeSubscribers}</span> active clinic {activeSubscribers === 1 ? 'subscription' : 'subscriptions'}
                    </p>
                </div>

                {/* 2. Subscription Period Revenue */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <span className="material-symbols-outlined">loyalty</span>
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            {timeFilter}
                        </span>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Subscription Revenue</h3>
                    <p className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">रू {subscriptionRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-on-surface-variant mt-2">
                        Gross subscription orders & renewals
                    </p>
                </div>

                {/* 3. Appointment Commission Revenue */}
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-container transition-transform hover:scale-[1.02] duration-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <span className="material-symbols-outlined">percent</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            {commissionRate}% Rate
                        </span>
                    </div>
                    <h3 className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Appointment Commission</h3>
                    <p className="font-headline-lg text-headline-lg text-emerald-700 font-bold tracking-tight">रू {commissionRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-on-surface-variant mt-2">
                        From paid & completed appointments
                    </p>
                </div>

                {/* 4. Total Platform Revenue */}
                <div className="bg-gradient-to-br from-slate-900 to-primary text-white p-6 rounded-xl border border-slate-700 shadow-lg transition-transform hover:scale-[1.02] duration-200 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div className="p-2 bg-white/10 text-white rounded-lg">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                            Combined Total
                        </span>
                    </div>
                    <h3 className="font-label-md text-label-md text-white/80 mb-1 uppercase tracking-wider relative z-10">Total Platform Revenue</h3>
                    <p className="font-headline-lg text-headline-lg text-white font-black tracking-tight relative z-10">रू {totalRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-white/70 mt-2 relative z-10">
                        Subscriptions + Appointment Commissions
                    </p>
                </div>
            </div>

            {/* OPERATIONAL & HEALTH METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Active Organizations */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <span className="material-symbols-outlined text-[28px]">local_hospital</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Organizations</p>
                            <h4 className="text-2xl font-bold text-on-surface mt-0.5">{activeCount}</h4>
                            <p className="text-[11px] text-blue-600 font-medium">+{newThisWeek} new this week</p>
                        </div>
                    </div>
                    {pendingExtensionsCount > 0 && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1" title="Pending Emergency Extension Requests">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {pendingExtensionsCount} Ext Req
                        </span>
                    )}
                </div>

                {/* Total Footfall */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container flex items-center gap-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                        <span className="material-symbols-outlined text-[28px]">groups</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Clients Footfall</p>
                        <h4 className="text-2xl font-bold text-on-surface mt-0.5">{totalPatientFootfall.toLocaleString('en-US')}</h4>
                        <p className="text-[11px] text-on-surface-variant">Cross-platform client bookings</p>
                    </div>
                </div>

                {/* System Uptime */}
                <div className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <span className="material-symbols-outlined text-[28px]">check_circle</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">System Availability</p>
                            <h4 className="text-2xl font-mono-data font-bold text-on-surface mt-0.5">{uptime.toFixed(2)}%</h4>
                            <p className="text-[11px] text-emerald-600 font-medium">All services operational</p>
                        </div>
                    </div>
                    {expiringSoonCount > 0 && (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold rounded-lg flex items-center gap-1" title="Subscriptions expiring within 7 days">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            {expiringSoonCount} Expiring Soon
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
