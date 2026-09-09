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

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const terms = useOrganizationTerms();

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            if (response.data?.primaryAccentColor) {
                applyTheme(response.data.primaryAccentColor);
            }
            if (response.data?.organizationName) {
                localStorage.setItem('organizationName', response.data.organizationName);
            }
            if (response.data?.organizationType) {
                setAndBroadcastOrgType(response.data.organizationType);
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

                        {/* Page Heading */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-2xl sm:text-headline-lg font-headline-lg font-black text-primary tracking-tight">Welcome back, Admin</h1>
                                <p className="font-body-md text-body-md text-on-surface-variant">Here is what is happening across {data?.organizationName || 'your workspace'} today.</p>
                            </div>
                            <button 
                                onClick={() => setIsNewAppointmentModalOpen(true)}
                                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 w-full sm:w-auto cursor-pointer"
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
            </div>
        </div>
    );
}
