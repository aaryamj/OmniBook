import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../superAdminPage/superAdmin.css';
import AdminSidebar from './components/AdminSidebar';
import TopNavigation from '../superAdminPage/components/TopNavigation';
import { getOrganizationTerms } from '../../utils/organizationTerms';

interface AdminSubscriptionOverview {
    tenantName?: string;
    organizationName?: string;
    organizationType?: string;
    registrationNumber?: string;
    plan?: string;
    planTier?: string;
    currentPlan?: string;
    displayName?: string;
    planDisplayName?: string;
    billingCycle?: string;
    subscriptionStatus?: string;
    status?: string;
    subscriptionStartDate?: string;
    subscriptionExpiryDate?: string;
    remainingDays?: number;
    amountPaid?: number;
    monthlyPrice?: number;
    annualPrice?: number;
    userLimit?: number;
    currentUsers?: number;
    appointmentLimit?: number;
    currentAppointmentsThisMonth?: number;
    isGated?: boolean;
    lastSuspendedReason?: string;
    features?: string[] | string;
}

interface SubscriptionPlan {
    id: number;
    name: string;
    displayName: string;
    monthlyPrice: number;
    annualPrice: number;
    description: string;
    features?: string[] | string;
    featuresRaw?: string;
    userLimit: number;
    appointmentLimit: number;
    active: boolean;
    isPopular: boolean;
}

const parseFeaturesList = (raw?: string[] | string): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw === 'string') {
        const separator = raw.includes('\n') ? '\n' : ',';
        return raw.split(separator).map(s => s.trim()).filter(Boolean);
    }
    return [];
};

interface ExtensionRequest {
    id: number;
    tenantName: string;
    registrationNumber: string;
    currentPlan: string;
    requestedDays: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedBy: string;
    reviewedBy?: string;
    approvedDays?: number;
    adminNotes?: string;
    previousExpiryDate?: string;
    newExpiryDate?: string;
    createdAt?: string;
}

export default function AdminSubscriptionPage() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState<AdminSubscriptionOverview | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [extensionRequests, setExtensionRequests] = useState<ExtensionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBillingCycle, setSelectedBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
    const [selectedPlanName, setSelectedPlanName] = useState<string>('PROFESSIONAL');
    const [paymentMethod, setPaymentMethod] = useState<'ESEWA' | 'STRIPE'>('ESEWA');

    // Modals
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
    const [extensionDays, setExtensionDays] = useState(7);
    const [extensionReason, setExtensionReason] = useState('');
    const [isSubmittingExtension, setIsSubmittingExtension] = useState(false);

    const [isRenewing, setIsRenewing] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; show: boolean }>({
        message: '',
        type: 'info',
        show: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type, show: true });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [overviewRes, plansRes, extRes] = await Promise.all([
                axios.get('http://localhost:8080/api/v1/subscriptions/my-overview', authHeaders),
                axios.get('http://localhost:8080/api/v1/subscriptions/plans'),
                axios.get('http://localhost:8080/api/v1/subscriptions/extension-requests/my', authHeaders)
            ]);

            setOverview(overviewRes.data);
            setPlans(plansRes.data);
            setExtensionRequests(extRes.data);
            if (overviewRes.data?.plan) {
                setSelectedPlanName(overviewRes.data.plan);
            }
            if (overviewRes.data?.billingCycle) {
                setSelectedBillingCycle(overviewRes.data.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY');
            }
        } catch (err: any) {
            console.error('Failed to load subscription overview', err);
            showToast(err.response?.data?.message || 'Failed to load subscription details', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment_success') === 'true') {
            const orderNum = params.get('order_number');
            showToast(`Payment verified successfully! Order ${orderNum || ''} processed. Subscription upgraded.`, 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchData();
        } else if (params.get('payment') === 'failed') {
            const err = params.get('error') || 'Transaction verification failed.';
            showToast(`Payment failed or was not verified (${err}). Existing subscription remains unchanged.`, 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchData();
        } else if (params.get('payment') === 'cancelled') {
            showToast('Payment was cancelled. Your existing subscription remains unchanged.', 'info');
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchData();
        } else {
            fetchData();
        }
    }, []);

    // Handle Renewal or Upgrade with Real Payment Gateway Redirection
    const handleRenewOrUpgrade = async () => {
        try {
            setIsRenewing(true);
            const res = await axios.post('http://localhost:8080/api/v1/subscriptions/renew', {
                planName: selectedPlanName,
                billingCycle: selectedBillingCycle,
                paymentMethod: paymentMethod
            }, authHeaders);

            const { gatewayUrl, formData } = res.data || {};

            if (formData && gatewayUrl) {
                // eSewa Sandbox Gateway: construct and submit form with HMAC signature
                showToast('Redirecting to eSewa payment gateway...', 'info');
                const formEl = document.createElement('form');
                formEl.method = 'POST';
                formEl.action = gatewayUrl;
                Object.keys(formData).forEach((key) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = formData[key];
                    formEl.appendChild(input);
                });
                document.body.appendChild(formEl);
                formEl.submit();
                return;
            } else if (gatewayUrl) {
                // Stripe Checkout Gateway: redirect directly
                showToast('Redirecting to Stripe secure checkout...', 'info');
                window.location.href = gatewayUrl;
                return;
            }

            showToast(res.data?.message || 'Subscription processed successfully!', 'success');
            await fetchData();
        } catch (err: any) {
            console.error('Renewal failed', err);
            showToast(err.response?.data?.message || 'Renewal failed. Please check payment credentials.', 'error');
        } finally {
            setIsRenewing(false);
        }
    };

    // Handle Emergency Extension Request
    const handleSubmitExtension = async () => {
        if (!extensionReason.trim()) {
            showToast('Please provide a mandatory justification for the extension request', 'error');
            return;
        }

        try {
            setIsSubmittingExtension(true);
            const res = await axios.post('http://localhost:8080/api/v1/subscriptions/extension-request', {
                requestedDays: extensionDays,
                reason: extensionReason
            }, authHeaders);

            showToast(res.data?.message || 'Emergency extension request submitted successfully!', 'success');
            setIsExtensionModalOpen(false);
            setExtensionReason('');
            setExtensionDays(7);
            await fetchData();
        } catch (err: any) {
            console.error('Failed to submit extension request', err);
            showToast(err.response?.data?.message || 'Failed to submit extension request', 'error');
        } finally {
            setIsSubmittingExtension(false);
        }
    };

    if (loading || !overview) {
        return (
            <div className="tenant-theme min-h-screen flex items-center justify-center bg-background text-on-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="font-mono-data text-on-surface-variant">Loading Subscription & Billing...</p>
                </div>
            </div>
        );
    }

    const activePlanName = (overview.plan || overview.planTier || overview.currentPlan || 'Starter').toUpperCase();
    const currentPlanObj = plans.find(p => p?.name && p.name.toUpperCase() === activePlanName);
    const orgTerms = getOrganizationTerms(overview.organizationType || (typeof window !== 'undefined' ? localStorage.getItem('organizationType') : null));

    // Dynamic capacity calculations
    const userLimit = overview.userLimit ?? -1;
    const currentUsers = overview.currentUsers ?? 0;
    const userPercent = userLimit > 0 
        ? Math.min(100, Math.round((currentUsers / userLimit) * 100)) 
        : (currentUsers > 0 ? 20 : 0);
    const userBarColor = userPercent >= 90 
        ? 'bg-rose-500' 
        : userPercent >= 75 
            ? 'bg-amber-500' 
            : 'bg-primary';

    const apptLimit = overview.appointmentLimit ?? -1;
    const currentAppts = overview.currentAppointmentsThisMonth ?? 0;
    const apptPercent = apptLimit > 0 
        ? Math.min(100, Math.round((currentAppts / apptLimit) * 100)) 
        : (currentAppts > 0 ? 25 : 0);
    const apptBarColor = apptPercent >= 90 
        ? 'bg-rose-500' 
        : apptPercent >= 75 
            ? 'bg-amber-500' 
            : 'bg-emerald-600';

    return (
        <div className="tenant-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen">
                <AdminSidebar />
                <TopNavigation />

                {/* Toast Notification */}
                {toast.show && (
                    <div className="fixed top-20 right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border text-white font-medium ${
                            toast.type === 'success' ? 'bg-emerald-700 border-emerald-600' :
                            toast.type === 'error' ? 'bg-red-700 border-red-600' : 'bg-zinc-800 border-zinc-700'
                        }`}>
                            <span className="material-symbols-outlined text-[20px]">
                                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
                            </span>
                            <span>{toast.message}</span>
                        </div>
                    </div>
                )}

                <main className="lg:ml-[280px] ml-0 ml-sidebar-width pt-24 pb-gutter px-gutter min-h-screen">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-6">
                            <div>
                                <h1 className="text-2xl sm:text-headline-lg font-headline-lg font-black text-primary tracking-tight">
                                    Subscription & Billing Management
                                </h1>
                                <p className="font-body-md text-on-surface-variant mt-1">
                                    Manage your {orgTerms.facilityLabel.toLowerCase()}'s software license, renewal schedule, quotas, and emergency extensions.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsExtensionModalOpen(true)}
                                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">more_time</span>
                                    Request Emergency Extension
                                </button>
                                <button
                                    onClick={fetchData}
                                    className="p-2.5 border border-outline-variant bg-white rounded-xl hover:bg-surface-container transition-all text-on-surface-variant cursor-pointer"
                                    title="Refresh Details"
                                >
                                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                                </button>
                            </div>
                        </div>

                        {/* STATUS BANNER (IF EXPIRING SOON, EXPIRED, OR SUSPENDED) */}
                        {overview.isGated && (
                            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                overview.subscriptionStatus === 'SUSPENDED' 
                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                    : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                        overview.subscriptionStatus === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        <span className="material-symbols-outlined text-[28px]">
                                            {overview.subscriptionStatus === 'SUSPENDED' ? 'block' : 'lock_clock'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {overview.subscriptionStatus === 'SUSPENDED'
                                                ? `${orgTerms.facilityLabel} Workspace Suspended by Super Admin`
                                                : 'Subscription Expired - Renewal Required'}
                                        </h3>
                                        <p className="text-xs sm:text-sm mt-1 leading-relaxed">
                                            {overview.subscriptionStatus === 'SUSPENDED'
                                                ? `Your workspace operations have been suspended. Reason: "${overview.lastSuspendedReason || 'Administrative restriction'}". Please contact support or request an emergency extension.`
                                                : `Your subscription ended on ${overview.subscriptionExpiryDate || 'recently'}. ${orgTerms.facilityLabel} ${orgTerms.appointmentPlural.toLowerCase()} and ${orgTerms.providerPlural.toLowerCase()} tools are gated until renewed.`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => setIsExtensionModalOpen(true)}
                                        className="px-4 py-2 bg-white text-on-surface border border-outline-variant rounded-xl text-xs font-bold hover:bg-surface-container transition-all cursor-pointer"
                                    >
                                        Request Grace Extension
                                    </button>
                                </div>
                            </div>
                        )}

                        {overview.subscriptionStatus === 'EXPIRING_SOON' && !overview.isGated && (
                            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-600">warning</span>
                                    <p className="text-xs sm:text-sm font-medium">
                                        Your subscription expires in <strong className="font-bold">{overview.remainingDays} days</strong> ({overview.subscriptionExpiryDate}). Renew now to prevent any operational downtime.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const el = document.getElementById('renewal-section');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
                                >
                                    Renew Now
                                </button>
                            </div>
                        )}

                        {/* SECTION 1: CURRENT PLAN SUMMARY & QUOTAS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Card 1: Active Subscription Card */}
                            <div className="lg:col-span-2 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-surface-container pb-4">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Current Active Plan</span>
                                        <div className="flex items-center gap-3 mt-1">
                                            <h2 className="text-2xl font-black text-primary">{overview.displayName || overview.plan}</h2>
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                                                overview.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                                overview.subscriptionStatus === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-800' :
                                                overview.subscriptionStatus === 'SUSPENDED' ? 'bg-rose-100 text-rose-800' :
                                                'bg-zinc-100 text-zinc-800'
                                            }`}>
                                                {overview.subscriptionStatus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-on-surface-variant block font-medium">Billing Cadence</span>
                                        <span className="font-mono font-bold text-sm text-primary uppercase">
                                            {overview.billingCycle || 'MONTHLY'} CYCLE
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
                                        <span className="text-[11px] text-outline uppercase font-bold block">Start Date</span>
                                        <span className="text-xs font-mono font-bold text-on-surface mt-1 block">
                                            {overview.subscriptionStartDate || 'Active'}
                                        </span>
                                    </div>
                                    <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
                                        <span className="text-[11px] text-outline uppercase font-bold block">Expiry Date</span>
                                        <span className="text-xs font-mono font-bold text-on-surface mt-1 block">
                                            {overview.subscriptionExpiryDate || 'Indefinite'}
                                        </span>
                                    </div>
                                    <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
                                        <span className="text-[11px] text-outline uppercase font-bold block">Days Left</span>
                                        <span className={`text-xs font-mono font-bold mt-1 block ${
                                            (overview.remainingDays ?? 0) <= 3 ? 'text-rose-600' :
                                            (overview.remainingDays ?? 0) <= 7 ? 'text-amber-600' : 'text-emerald-700'
                                        }`}>
                                            {(overview.remainingDays ?? 0) > 0 ? `${overview.remainingDays} Days` : '0 Days (Expired)'}
                                        </span>
                                    </div>
                                    <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/40">
                                        <span className="text-[11px] text-outline uppercase font-bold block">Rate Paid</span>
                                        <span className="text-xs font-mono font-bold text-primary mt-1 block">
                                            Rs. {(overview.amountPaid ?? overview.monthlyPrice ?? 2000).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Plan Features */}
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Included Capabilities</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {parseFeaturesList(overview.features).length > 0 ? (
                                            parseFeaturesList(overview.features).map((feat, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-on-surface">
                                                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                                                    <span>{feat}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-on-surface-variant">Default platform tier features active.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Quotas & Limits */}
                            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-on-surface mb-1">{orgTerms.facilityLabel} Quotas & Capacity</h3>
                                    <p className="text-xs text-on-surface-variant">Allocated based on your active {overview.displayName} plan.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-on-surface-variant">{orgTerms.providerPlural}</span>
                                            <span className="font-mono font-bold text-primary">
                                                {userLimit > 0 
                                                    ? `${currentUsers} / ${userLimit} Seats (${userPercent}%)` 
                                                    : `${currentUsers} Active (Unlimited Seats)`}
                                            </span>
                                        </div>
                                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`${userBarColor} h-full rounded-full transition-all duration-500`} 
                                                style={{ width: `${Math.max(userPercent, currentUsers > 0 ? 5 : 0)}%` }}
                                            ></div>
                                        </div>
                                        {userLimit > 0 && (
                                            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                                                <span>{Math.max(0, userLimit - currentUsers)} seats remaining</span>
                                                <span>Max {userLimit} Seats</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-on-surface-variant">Monthly {orgTerms.appointmentPlural}</span>
                                            <span className="font-mono font-bold text-primary">
                                                {apptLimit > 0 
                                                    ? `${currentAppts} / ${apptLimit} Mo (${apptPercent}%)` 
                                                    : `${currentAppts} Booked (Unlimited)`}
                                            </span>
                                        </div>
                                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`${apptBarColor} h-full rounded-full transition-all duration-500`} 
                                                style={{ width: `${Math.max(apptPercent, currentAppts > 0 ? 5 : 0)}%` }}
                                            ></div>
                                        </div>
                                        {apptLimit > 0 && (
                                            <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                                                <span>{Math.max(0, apptLimit - currentAppts)} bookings remaining this month</span>
                                                <span>{apptLimit} / Mo Limit</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                                    <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0">info</span>
                                    <span>
                                        Need more {orgTerms.providerPlural.toLowerCase()} or higher {orgTerms.appointmentSingular.toLowerCase()} volume? Upgrade your tier below. Early renewal preserves remaining valid days.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: RENEW OR UPGRADE CATALOG */}
                        <div id="renewal-section" className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-primary">Renew or Change Subscription Tier</h3>
                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                        All prices are dynamic from platform database. Early renewals add full period to your existing expiry date without losing time.
                                    </p>
                                </div>

                                {/* Cadence Switcher */}
                                <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBillingCycle('MONTHLY')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            selectedBillingCycle === 'MONTHLY'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-on-surface-variant hover:text-on-surface'
                                        }`}
                                    >
                                        Monthly Billing
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedBillingCycle('ANNUAL')}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            selectedBillingCycle === 'ANNUAL'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-on-surface-variant hover:text-on-surface'
                                        }`}
                                    >
                                        <span>Annual Billing</span>
                                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">SAVE ~15%</span>
                                    </button>
                                </div>
                            </div>

                            {/* Plan Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {plans.map((p) => {
                                    const isCurrent = activePlanName === (p?.name || '').toUpperCase();
                                    const isSelected = (selectedPlanName || '').toUpperCase() === (p?.name || '').toUpperCase();
                                    const price = selectedBillingCycle === 'ANNUAL' ? (p.annualPrice ?? 0) : (p.monthlyPrice ?? 0);

                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedPlanName(p.name)}
                                            className={`relative border-2 rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'border-outline-variant hover:border-outline bg-surface-container-lowest'
                                            }`}
                                        >
                                            {p.isPopular && (
                                                <span className="absolute -top-3 right-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                                                    Popular Tier
                                                </span>
                                            )}

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-on-surface">{p.displayName}</h4>
                                                        <p className="text-xs text-on-surface-variant mt-0.5">{p.description}</p>
                                                    </div>
                                                    {isCurrent && (
                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded-md">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="pt-2">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-primary font-mono">
                                                            Rs. {price.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-on-surface-variant">
                                                            /{selectedBillingCycle === 'ANNUAL' ? 'year' : 'month'}
                                                        </span>
                                                    </div>
                                                    {selectedBillingCycle === 'ANNUAL' && (
                                                        <p className="text-[11px] text-emerald-700 font-mono font-medium mt-0.5">
                                                            Equivalent to Rs. {(price / 12.0).toFixed(0)}/mo
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-surface-container text-xs space-y-2 text-on-surface">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                                                        <span>Up to {p.userLimit} Practitioners / Staff</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[15px] text-primary">calendar_month</span>
                                                        <span>{p.appointmentLimit > 0 ? `${p.appointmentLimit} Appointments / Mo` : 'Unlimited Appointments'}</span>
                                                    </div>
                                                    {parseFeaturesList(p.features).length > 0 && (
                                                        <div className="pt-2 text-[11px] text-on-surface-variant space-y-1">
                                                            {parseFeaturesList(p.features).slice(0, 3).map((f, i) => (
                                                                <div key={i} className="flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined text-[13px] text-emerald-600">check</span>
                                                                    <span>{f}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-5 mt-4 border-t border-surface-container">
                                                <button
                                                    type="button"
                                                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                                                        isSelected
                                                            ? 'bg-primary text-white shadow-sm'
                                                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                                                    }`}
                                                >
                                                    {isSelected ? 'Selected Tier' : 'Select Tier'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Payment Checkout Confirmation Bar */}
                            <div className="pt-4 border-t border-surface-container flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-on-surface">Payment Method:</span>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="ESEWA"
                                                checked={paymentMethod === 'ESEWA'}
                                                onChange={() => setPaymentMethod('ESEWA')}
                                                className="text-primary"
                                            />
                                            eSewa Wallet (NPR)
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="STRIPE"
                                                checked={paymentMethod === 'STRIPE'}
                                                onChange={() => setPaymentMethod('STRIPE')}
                                                className="text-primary"
                                            />
                                            Credit / Debit Card (Stripe)
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRenewOrUpgrade}
                                    disabled={isRenewing}
                                    className="px-6 py-3 bg-primary hover:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isRenewing ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                            <span>Processing Checkout...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">verified</span>
                                            <span>Confirm & Process Subscription</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SECTION 3: EMERGENCY EXTENSION HISTORY */}
                        <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-surface-container pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-primary">Emergency Extension Requests</h3>
                                    <p className="text-xs text-on-surface-variant">
                                        History of grace period requests submitted to the platform Super Admin.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsExtensionModalOpen(true)}
                                    className="px-3.5 py-1.5 border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    New Request
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-surface-container bg-surface-container-low/50">
                                            <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Requested Days</th>
                                            <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Mandatory Justification</th>
                                            <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Submitted At</th>
                                            <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Status</th>
                                            <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Review Outcome</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extensionRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-6 text-center text-xs text-on-surface-variant">
                                                    No emergency extension requests submitted.
                                                </td>
                                            </tr>
                                        ) : (
                                            extensionRequests.map(req => (
                                                <tr key={req.id} className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                                                    <td className="py-3.5 px-4 font-mono font-bold text-primary text-xs">
                                                        {req.requestedDays} Days
                                                        {req.approvedDays ? (
                                                            <span className="block text-[11px] text-emerald-700 font-bold">
                                                                (Approved: {req.approvedDays}d)
                                                            </span>
                                                        ) : null}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-on-surface max-w-sm">
                                                        <p className="bg-surface-container-low p-2 rounded-lg border border-outline-variant/40">
                                                            "{req.reason}"
                                                        </p>
                                                        {req.adminNotes && (
                                                            <p className="text-[11px] text-on-surface-variant mt-1 italic">
                                                                Admin Notes: {req.adminNotes}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-on-surface-variant font-mono">
                                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase ${
                                                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                            req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-xs text-on-surface font-mono">
                                                        {req.status === 'APPROVED' && (
                                                            <span className="text-emerald-700 font-bold">
                                                                Extended to {req.newExpiryDate || 'Granted'}
                                                            </span>
                                                        )}
                                                        {req.status === 'REJECTED' && (
                                                            <span className="text-rose-700">Request Declined</span>
                                                        )}
                                                        {req.status === 'PENDING' && (
                                                            <span className="text-amber-700">Awaiting Super Admin</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>

                {/* EMERGENCY EXTENSION SUBMISSION MODAL */}
                {isExtensionModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-4 animate-in zoom-in-95 duration-150 text-left">
                            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[24px]">more_time</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-on-surface">Emergency Extension Request</h3>
                                        <p className="text-xs text-on-surface-variant">Request a grace period from Super Admin</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsExtensionModalOpen(false)}
                                    disabled={isSubmittingExtension}
                                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                                <span className="font-bold block">Grace Extension Guidelines</span>
                                <p className="leading-relaxed">
                                    Extensions are granted at the platform Super Admin's discretion for billing transitions or emergency access. Please state your reason clearly.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Requested Additional Days (1 - 30) *</label>
                                <input
                                    type="number"
                                    value={extensionDays}
                                    onChange={(e) => setExtensionDays(Math.min(30, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                                    min={1}
                                    max={30}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Mandatory Justification / Reason *</label>
                                <textarea
                                    value={extensionReason}
                                    onChange={(e) => setExtensionReason(e.target.value)}
                                    placeholder="Explain why an emergency extension is needed (e.g. Finance approval in progress, banking holiday, etc.)..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setIsExtensionModalOpen(false)}
                                    disabled={isSubmittingExtension}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-xs font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitExtension}
                                    disabled={isSubmittingExtension || !extensionReason.trim()}
                                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingExtension ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
