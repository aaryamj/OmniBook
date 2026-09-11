import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../superAdminPage/superAdmin.css';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import AdminKPIs from './components/AdminKPIs';
import LivePatientFlowTracker from './components/LivePatientFlowTracker';
import WeeklyAppointments from './components/WeeklyAppointments';
import ProviderMatrix from './components/ProviderMatrix';
import DualLedgerClearing from './components/DualLedgerClearing';
import NewAppointmentModal from './components/NewAppointmentModal';
import { applyTheme } from '../../utils/themeUtils';
import { useOrganizationTerms, setAndBroadcastOrgType } from '../../utils/organizationTerms';

interface DashboardData {
    todayVolume: number;
    totalCapacity: number;
    activeInClinic: number;
    waitingPatients: number;
    inConsultPatients: number;
    esewaSettled: number;
    stripeConnect: number;
    esewaWeeklyVolume: number;
    stripeWeeklyVolume: number;
    livePatientFlow: any[];
    weeklyAppointments: number[];
    providerMatrix: any[];
    primaryAccentColor?: string;
    organizationName?: string;
    organizationType?: string;
}

interface SubscriptionOverview {
    plan: string;
    displayName: string;
    subscriptionStatus: string;
    subscriptionExpiryDate: string;
    remainingDays: number;
    isGated: boolean;
    lastSuspendedReason?: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [subOverview, setSubOverview] = useState<SubscriptionOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const terms = useOrganizationTerms();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
            
            const [dashRes, subRes] = await Promise.allSettled([
                axios.get('http://localhost:8080/api/v1/admin/dashboard', authHeaders),
                axios.get('http://localhost:8080/api/v1/subscriptions/my-overview', authHeaders)
            ]);

            if (dashRes.status === 'fulfilled') {
                setData(dashRes.value.data);
                if (dashRes.value.data?.primaryAccentColor) {
                    applyTheme(dashRes.value.data.primaryAccentColor);
                }
                if (dashRes.value.data?.organizationName) {
                    localStorage.setItem('organizationName', dashRes.value.data.organizationName);
                }
                if (dashRes.value.data?.organizationType) {
                    setAndBroadcastOrgType(dashRes.value.data.organizationType);
                }
            }

            if (subRes.status === 'fulfilled') {
                setSubOverview(subRes.value.data);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading || !data) {
        return (
            <div className="tenant-theme min-h-screen flex items-center justify-center bg-background text-on-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="font-mono-data text-on-surface-variant">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tenant-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <AdminSidebar />
                <TopNavigation />

                {/* Main Content Area */}
                <main className="lg:ml-[280px] ml-0 ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-container-max mx-auto space-y-gutter">

                        {/* EXPIRING SOON WARNING BANNER */}
                        {subOverview?.subscriptionStatus === 'EXPIRING_SOON' && !subOverview.isGated && (
                            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 px-5 py-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">notification_important</span>
                                    </div>
                                    <div className="text-xs sm:text-sm">
                                        <span className="font-bold block text-amber-950">Subscription Expiring Soon</span>
                                        <span>
                                            Your {subOverview.displayName || subOverview.plan} tier has <strong className="font-mono font-bold">{subOverview.remainingDays} days</strong> remaining (expires {subOverview.subscriptionExpiryDate}).
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/subscription')}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
                                >
                                    Renew Subscription
                                </button>
                            </div>
                        )}

                        {/* Page Heading */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-2xl sm:text-headline-lg font-headline-lg font-black text-primary tracking-tight">Welcome back, Admin</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Here is what is happening across {data?.organizationName || 'your workspace'} today.</p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (subOverview?.isGated) {
                                        navigate('/admin/subscription');
                                    } else {
                                        setIsNewAppointmentModalOpen(true);
                                    }
                                }}
                                disabled={subOverview?.isGated}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded font-bold transition-all shadow-md w-full sm:w-auto ${
                                    subOverview?.isGated
                                        ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                                        : 'bg-primary text-on-primary hover:brightness-110 active:scale-95 shadow-primary/20 cursor-pointer'
                                }`}
                            >
                                <span className="material-symbols-outlined">add</span>
                                New {terms.appointmentSingular}
                            </button>
                        </div>

                        {/* KPI ROW */}
                        <AdminKPIs
                            todayVolume={data.todayVolume}
                            totalCapacity={data.totalCapacity}
                            activeInClinic={data.activeInClinic}
                            waitingPatients={data.waitingPatients}
                            inConsultPatients={data.inConsultPatients}
                            esewaSettled={data.esewaSettled}
                            stripeConnect={data.stripeConnect}
                        />

                        {/* MAIN GRID CONTENT */}
                        <div className="flex flex-col space-y-gutter">
                            {/* PATIENT FLOW TRACKER */}
                            <div className="w-full">
                                <LivePatientFlowTracker
                                    flows={data.livePatientFlow}
                                    onRefresh={fetchDashboardData}
                                />
                            </div>

                            {/* WEEKLY APPOINTMENTS */}
                            <div className="w-full">
                                <WeeklyAppointments data={data.weeklyAppointments} />
                            </div>

                            {/* PROVIDER MATRIX & LEDGER */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                                <ProviderMatrix providers={data.providerMatrix} />
                                <DualLedgerClearing
                                    esewaWeeklyVolume={data.esewaWeeklyVolume}
                                    stripeWeeklyVolume={data.stripeWeeklyVolume}
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Walk-in Registration Modal */}
                <NewAppointmentModal
                    isOpen={isNewAppointmentModalOpen}
                    onClose={() => setIsNewAppointmentModalOpen(false)}
                    onSuccess={fetchDashboardData}
                />

                {/* ============================================================ */}
                {/* PROMINENT BLOCKING RENEWAL GATE OVERLAY */}
                {/* ============================================================ */}
                {subOverview?.isGated && (
                    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-outline-variant text-center space-y-6 animate-in zoom-in-95 duration-200">
                            {/* Icon Indicator */}
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${
                                subOverview.subscriptionStatus === 'SUSPENDED'
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-amber-100 text-amber-600'
                            }`}>
                                <span className="material-symbols-outlined text-[44px]">
                                    {subOverview.subscriptionStatus === 'SUSPENDED' ? 'block' : 'lock'}
                                </span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                    subOverview.subscriptionStatus === 'SUSPENDED'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {subOverview.subscriptionStatus === 'SUSPENDED' ? 'Workspace Suspended' : 'Subscription Expired'}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-black text-primary">
                                    {subOverview.subscriptionStatus === 'SUSPENDED'
                                        ? 'Clinic Operations Suspended'
                                        : 'Renewal Gate: Access Gated'}
                                </h2>
                                <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
                                    {subOverview.subscriptionStatus === 'SUSPENDED' ? (
                                        <>
                                            This workspace has been manually suspended by the platform Super Admin.
                                            {subOverview.lastSuspendedReason && (
                                                <span className="block font-medium text-rose-900 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-2 italic text-left">
                                                    Reason: "{subOverview.lastSuspendedReason}"
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Your <strong className="text-on-surface">{subOverview.displayName || subOverview.plan}</strong> license expired on <strong className="font-mono text-primary">{subOverview.subscriptionExpiryDate || 'recently'}</strong>. 
                                            Patient check-ins, appointment scheduling, and practitioner flows are temporarily gated until renewal.
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/subscription')}
                                    className="w-full sm:w-auto px-7 py-3.5 bg-primary hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px]">verified</span>
                                    <span>Renew Subscription</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/subscription')}
                                    className="w-full sm:w-auto px-6 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[20px]">more_time</span>
                                    <span>Emergency Extension</span>
                                </button>
                            </div>

                            <p className="text-[11px] text-outline">
                                Need administrative assistance? Billing and subscription extension requests remain fully accessible.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
