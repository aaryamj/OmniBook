interface Activity {
    id: number;
    name: string;
    status: string;
    location: string;
    time: string;
    icon: string;
    bgClass: string;
    textHover: string;
}

export interface SubscriptionOrderLookupItem {
    id: number;
    orderNumber: string;
    invoiceNumber?: string;
    organizationName: string;
    organizationType: string;
    registrationNumber: string;
    address?: string;
    adminFullName: string;
    adminEmail: string;
    adminPhone?: string;
    planTier: string;
    billingCycle?: string;
    amount?: number;
    currency?: string;
    paymentStatus?: string;
    verificationStatus?: string;
    tenantId?: number;
    createdAt?: string;
}

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GlobalAuditLogs from './GlobalAuditLogs';

export default function RecentOnboardingActivity({ timeFilter }: { timeFilter?: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [enforce2FA, setEnforce2FA] = useState(true);
    const [requireHIPAA, setRequireHIPAA] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [isDispatching, setIsDispatching] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const fetchActivities = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://localhost:8080/api/v1/superadmin/tenants', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: timeFilter ? { timeFilter } : undefined
            });
            
            const tenants = response.data;
            const mappedActivities: Activity[] = tenants.map((tenant: any) => {
                const createdAt = new Date(tenant.createdAt);
                const now = new Date();
                const diffMs = now.getTime() - createdAt.getTime();
                const diffMins = Math.round(diffMs / 60000);
                let timeAgo = '';
                if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                else if (diffMins < 1440) timeAgo = `${Math.round(diffMins/60)}h ago`;
                else timeAgo = `${Math.round(diffMins/1440)}d ago`;
                
                const isActive = tenant.status === 'ACTIVE';
                const isPendingVerification = tenant.status === 'PENDING_VERIFICATION';
                const isPendingSetup = tenant.status === 'PENDING_SETUP' || tenant.status === 'PENDING';

                let statusLabel = 'Suspended';
                let icon = 'block';
                let bgClass = 'bg-red-50 text-red-600';
                let textHover = 'group-hover:text-red-700';

                if (isActive) {
                    statusLabel = 'Account Activated';
                    icon = 'domain';
                    bgClass = 'bg-green-50 text-green-600';
                    textHover = 'group-hover:text-green-700';
                } else if (isPendingVerification) {
                    statusLabel = 'Awaiting Approval';
                    icon = 'verified_user';
                    bgClass = 'bg-amber-50 text-amber-600';
                    textHover = 'group-hover:text-amber-700';
                } else if (isPendingSetup) {
                    statusLabel = 'Invite Sent (Pending Setup)';
                    icon = 'mark_email_read';
                    bgClass = 'bg-blue-50 text-blue-600';
                    textHover = 'group-hover:text-blue-700';
                }
                
                return {
                    id: tenant.id,
                    name: tenant.organizationName,
                    status: statusLabel,
                    location: tenant.address || 'Location not provided',
                    time: timeAgo,
                    icon: icon,
                    bgClass: bgClass,
                    textHover: textHover
                };
            });
            
            mappedActivities.sort((a, b) => b.id - a.id);
            setActivities(mappedActivities);
        } catch (error) {
            console.error("Error fetching activities:", error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [timeFilter]);
    
    // Form State
    const [formData, setFormData] = useState({
        organizationType: 'Clinic',
        customOrganizationType: '',
        organizationName: '',
        registrationNumber: '',
        adminEmail: '',
        adminFullName: '',
        adminPhoneCode: '+1',
        adminPhone: '',
        address: '',
        subscriptionTier: 'Enterprise (Unlimited Providers)'
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    
    const validateStep1 = () => {
        const errors: Record<string, string> = {};
        if (formData.organizationType === 'Other Organization' && !formData.customOrganizationType.trim()) {
            errors.customOrganizationType = 'Organization Type is required';
        }
        if (!formData.organizationName.trim()) errors.organizationName = 'Organization Name is required';
        if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration Number is required';
        if (!formData.adminFullName.trim()) errors.adminFullName = 'Admin Full Name is required';
        if (!formData.adminEmail.trim()) {
            errors.adminEmail = 'Primary Admin Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
            errors.adminEmail = 'Invalid email address';
        }
        if (!formData.adminPhone.trim()) errors.adminPhone = 'Admin Phone is required';
        if (!formData.address.trim()) errors.address = 'Address / Location is required';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // =========================================================================
    // REAL-TIME DATABASE AUTO-FILL LOGIC (FROM subscription_orders TABLE)
    // =========================================================================
    const [matchingOrders, setMatchingOrders] = useState<SubscriptionOrderLookupItem[]>([]);
    const [recentOrders, setRecentOrders] = useState<SubscriptionOrderLookupItem[]>([]);
    const [isSearchingOrder, setIsSearchingOrder] = useState<boolean>(false);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [activeFieldFocused, setActiveFieldFocused] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<SubscriptionOrderLookupItem | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Fetch initial database subscription orders when drawer opens
    const fetchRecentSubscriptionOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/subscription-orders/lookup', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (Array.isArray(res.data)) {
                setRecentOrders(res.data);
            }
        } catch (e) {
            console.error('Failed to load recent subscription orders:', e);
        }
    };

    useEffect(() => {
        if (isDrawerOpen) {
            fetchRecentSubscriptionOrders();
        } else {
            setSelectedOrder(null);
            setShowSuggestions(false);
            setActiveFieldFocused(null);
            setMatchingOrders([]);
        }
    }, [isDrawerOpen]);

    // Smart Mappers
    const mapOrganizationType = (raw: string | undefined): { type: string; custom: string } => {
        if (!raw) return { type: 'Clinic', custom: '' };
        const lower = raw.trim().toLowerCase();
        if (lower.includes('clinic') || lower.includes('hospital') || lower.includes('medical') || lower.includes('health') || lower.includes('care')) {
            return { type: 'Clinic', custom: '' };
        }
        if (lower.includes('college') || lower.includes('school') || lower.includes('university') || lower.includes('campus') || lower.includes('academy') || lower.includes('institute')) {
            return { type: 'College', custom: '' };
        }
        if (lower.includes('saloon') || lower.includes('salon') || lower.includes('spa') || lower.includes('parlour') || lower.includes('beauty')) {
            return { type: 'Saloon', custom: '' };
        }
        return { type: 'Other Organization', custom: raw.trim() };
    };

    const mapSubscriptionTier = (rawTier: string | undefined): string => {
        if (!rawTier) return 'Enterprise (Unlimited Providers)';
        const lower = rawTier.trim().toLowerCase();
        if (lower.includes('starter')) return 'Starter (Up to 5 Providers)';
        if (lower.includes('pro')) return 'Professional (Up to 20 Providers)';
        if (lower.includes('enterprise')) return 'Enterprise (Unlimited Providers)';
        return 'Enterprise (Unlimited Providers)';
    };

    const parseAdminPhone = (rawPhone: string | undefined): { code: string; number: string } => {
        if (!rawPhone) return { code: '+977', number: '' };
        const cleaned = rawPhone.trim();
        const codes = ['+977', '+1', '+91', '+44', '+61'];
        for (const code of codes) {
            if (cleaned.startsWith(code)) {
                return { code, number: cleaned.slice(code.length).replace(/[^0-9]/g, '') };
            }
        }
        const digitsOnly = cleaned.replace(/[^0-9]/g, '');
        if (digitsOnly.length === 10 && (digitsOnly.startsWith('98') || digitsOnly.startsWith('97'))) {
            return { code: '+977', number: digitsOnly };
        }
        return { code: '+977', number: digitsOnly.slice(-10) };
    };

    const applySubscriptionOrder = (order: SubscriptionOrderLookupItem) => {
        const orgTypeResult = mapOrganizationType(order.organizationType);
        const tierResult = mapSubscriptionTier(order.planTier);
        const phoneResult = parseAdminPhone(order.adminPhone);

        setFormData({
            organizationType: orgTypeResult.type,
            customOrganizationType: orgTypeResult.custom,
            organizationName: order.organizationName || '',
            registrationNumber: order.registrationNumber || '',
            address: order.address || '',
            adminFullName: order.adminFullName || '',
            adminEmail: order.adminEmail || '',
            adminPhoneCode: phoneResult.code,
            adminPhone: phoneResult.number,
            subscriptionTier: tierResult
        });

        setSelectedOrder(order);
        setShowSuggestions(false);
        setActiveFieldFocused(null);
        setFormErrors({});
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        if (formErrors[fieldName]) {
            setFormErrors(prev => {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            });
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        const trimmed = value.trim();
        if (trimmed.length < 2) {
            setMatchingOrders([]);
            setShowSuggestions(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearchingOrder(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:8080/api/v1/superadmin/subscription-orders/lookup', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { query: trimmed }
                });
                if (Array.isArray(res.data)) {
                    setMatchingOrders(res.data);
                    setShowSuggestions(res.data.length > 0);

                    // Automatic seamless match when typing full registration number or email
                    if (res.data.length === 1) {
                        const exact = res.data[0];
                        const valLower = trimmed.toLowerCase();
                        if (
                            (fieldName === 'registrationNumber' && exact.registrationNumber?.toLowerCase() === valLower) ||
                            (fieldName === 'adminEmail' && exact.adminEmail?.toLowerCase() === valLower)
                        ) {
                            applySubscriptionOrder(exact);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to lookup subscription orders:', e);
            } finally {
                setIsSearchingOrder(false);
            }
        }, 250);
    };

    const renderSuggestionsDropdown = (fieldName: string) => {
        if (!showSuggestions || activeFieldFocused !== fieldName || matchingOrders.length === 0) {
            return null;
        }

        return (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-blue-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                <div className="px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-blue-600 text-[15px]">database</span>
                        <span className="text-[11px] font-bold text-blue-900">
                            Database Subscription Orders ({matchingOrders.length})
                        </span>
                    </div>
                    <button
                        type="button"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowSuggestions(false);
                        }}
                        className="text-slate-400 hover:text-slate-700 text-xs p-0.5 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {matchingOrders.map((order) => (
                        <div
                            key={order.id}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                applySubscriptionOrder(order);
                            }}
                            className="p-3 hover:bg-blue-50/70 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                                        {order.organizationName}
                                    </span>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                        {order.organizationType}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                                        {order.planTier}
                                    </span>
                                </div>
                                <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                                    <span>Reg: <strong className="text-slate-700">{order.registrationNumber || 'N/A'}</strong></span>
                                    <span>Email: <strong className="text-slate-700">{order.adminEmail}</strong></span>
                                    {order.adminPhone && <span>Phone: {order.adminPhone}</span>}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 shadow-2xs flex items-center gap-1 group-hover:scale-105 transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[13px]">download_done</span>
                                Auto-Fill
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    // Financial Report State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportType, setReportType] = useState('comprehensive');
    const [reportFormat, setReportFormat] = useState('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [timePeriod, setTimePeriod] = useState('Last 30 Days');
    
    // Audit Drawer State
    const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
    
    // Determine which activities to show based on state
    const displayedActivities = showAll ? activities : activities.slice(0, 4);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-gutter">
            {/* Recent Activity */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center bg-surface-container-low/30">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Recent Onboarding Activity</h3>
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors px-2 py-1 rounded hover:bg-blue-50"
                    >
                        {showAll ? 'View Less' : 'View All'}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: showAll ? '400px' : 'auto' }}>
                    <ul className="divide-y divide-surface-container transition-all duration-300">
                        {displayedActivities.map((activity) => (
                            <li key={activity.id} className="px-6 py-4 flex items-center hover:bg-surface-container-low transition-colors group cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-sm ${activity.bgClass}`}>
                                    <span className="material-symbols-outlined text-sm">{activity.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <p className={`font-body-md text-on-surface font-semibold transition-colors ${activity.textHover}`}>
                                        {activity.name}
                                    </p>
                                    <p className="text-[12px] text-on-surface-variant">
                                        {activity.status}{activity.location ? ` • ${activity.location}` : ''}
                                    </p>
                                </div>
                                <span className="text-[11px] font-mono-data text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                                    {activity.time}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Quick Actions</h3>
                <div className="space-y-4">
                    <button 
                        onClick={() => setIsDrawerOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-primary text-white rounded-lg hover:bg-on-primary-fixed-variant transition-all transform active:scale-95 duration-150 shadow-sm hover:shadow"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3">add_business</span>
                            <span className="font-body-md font-semibold">Invite New Organization</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-white border border-surface-container text-on-surface rounded-lg hover:bg-surface-container-low transition-all transform active:scale-95 duration-150"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3 text-on-surface-variant">description</span>
                            <span className="font-body-md font-semibold">Generate Financial Report</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    <button 
                        onClick={() => setIsAuditDrawerOpen(true)}
                        className="w-full group flex items-center justify-between p-4 bg-white border border-surface-container text-on-surface rounded-lg hover:bg-surface-container-low transition-all transform active:scale-95 duration-150"
                    >
                        <div className="flex items-center">
                            <span className="material-symbols-outlined mr-3 text-on-surface-variant">manage_search</span>
                            <span className="font-body-md font-semibold">View System Audit Logs</span>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
                    </button>
                    
                    <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start shadow-sm">
                        <span className="material-symbols-outlined text-blue-600 mr-3 animate-pulse">info</span>
                        <p className="text-[13px] text-blue-800 leading-relaxed">
                            The next scheduled system maintenance is set for <span className="font-bold border-b border-blue-300 border-dashed">Sunday at 02:00 AM UTC</span>. Ensure all cluster replicas are synced.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sliding Drawer Overlay */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                    {/* Dark Background Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        onClick={() => setIsDrawerOpen(false)}
                    ></div>
                    
                    {/* Right-Side Drawer Panel */}
                    <div className="relative w-full max-w-[35%] h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold">Provision New Tenant</h2>
                            <button 
                                onClick={() => {
                                    setIsDrawerOpen(false);
                                    setTimeout(() => { setCurrentStep(1); setIsDispatching(false); }, 300);
                                }}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="px-6 py-4 border-b border-surface-container bg-surface-container-low/30 flex gap-4">
                            <div 
                                className={`flex items-center gap-2 cursor-pointer transition-colors ${currentStep === 1 ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                                onClick={() => currentStep === 2 && setCurrentStep(1)}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${currentStep === 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'}`}>1</div>
                                <span className={`text-xs ${currentStep === 1 ? 'font-bold' : 'font-medium'}`}>Step 1: Organization Details</span>
                            </div>
                            <div className="text-outline-variant">
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </div>
                            <div className={`flex items-center gap-2 transition-colors ${currentStep === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm transition-colors ${currentStep === 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'}`}>2</div>
                                <span className={`text-xs ${currentStep === 2 ? 'font-bold' : 'font-medium'}`}>Step 2: Dispatch Invite</span>
                            </div>
                        </div>
                        
                        {/* Drawer Body (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar overflow-x-hidden">
                            <div className="relative w-full">
                                <div className={`transition-all duration-300 ${currentStep === 1 ? 'relative translate-x-0 opacity-100' : 'absolute top-0 left-0 -translate-x-full opacity-0 w-full'}`}>
                                    {/* Section 1: Organization & Access */}
                                    <section className="space-y-5 mb-8">
                                        <div className="flex items-center justify-between border-b border-surface-container pb-2">
                                            <h3 className="text-sm font-bold text-primary">Organization &amp; Access</h3>
                                            <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">bolt</span>
                                                Auto-fill Active
                                            </span>
                                        </div>

                                        {/* Quick Auto-Fill Banner / Selector from Database Orders */}
                                        {selectedOrder ? (
                                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                                        <span className="material-symbols-outlined text-[18px]">verified</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-bold text-emerald-950 truncate">Auto-Filled from Order #{selectedOrder.orderNumber}</span>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 uppercase">
                                                                {selectedOrder.planTier}
                                                            </span>
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                                                                {selectedOrder.organizationType}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-emerald-700 mt-0.5 truncate">
                                                            {selectedOrder.organizationName} • {selectedOrder.adminEmail} • Reg: {selectedOrder.registrationNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedOrder(null);
                                                        setFormData({
                                                            organizationType: 'Clinic',
                                                            customOrganizationType: '',
                                                            organizationName: '',
                                                            registrationNumber: '',
                                                            adminEmail: '',
                                                            adminFullName: '',
                                                            adminPhoneCode: '+977',
                                                            adminPhone: '',
                                                            address: '',
                                                            subscriptionTier: 'Enterprise (Unlimited Providers)'
                                                        });
                                                    }}
                                                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100/50 transition-colors shrink-0 cursor-pointer shadow-2xs"
                                                >
                                                    Clear / Reset
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-xl space-y-2 shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                                                        <span className="material-symbols-outlined text-[17px] text-blue-600 animate-pulse">database</span>
                                                        <span>Real-Time Database Auto-Fill</span>
                                                    </div>
                                                    {recentOrders.length > 0 && (
                                                        <span className="text-[10px] text-blue-700 font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-blue-200">
                                                            {recentOrders.length} database orders
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-blue-800/80 leading-tight">
                                                    Select an existing order below or type in any field to auto-populate all organization details, tier &amp; admin contact.
                                                </p>
                                                <div className="relative">
                                                    <select
                                                        onChange={(e) => {
                                                            const orderId = Number(e.target.value);
                                                            const found = recentOrders.find(o => o.id === orderId) || matchingOrders.find(o => o.id === orderId);
                                                            if (found) applySubscriptionOrder(found);
                                                        }}
                                                        defaultValue=""
                                                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-primary font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs appearance-none pr-8"
                                                    >
                                                        <option value="" disabled>Choose verified subscription order from database...</option>
                                                        {recentOrders.map(o => (
                                                            <option key={o.id} value={o.id}>
                                                                {o.organizationName} ({o.organizationType}) — Order #{o.orderNumber} [{o.planTier} Plan]
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[16px]">
                                                        expand_more
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Organization Type</label>
                                            <div className="relative">
                                                <select 
                                                    value={formData.organizationType}
                                                    onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
                                                    className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer"
                                                >
                                                    <option value="Clinic">Clinic</option>
                                                    <option value="College">College</option>
                                                    <option value="Saloon">Saloon</option>
                                                    <option value="Other Organization">Other Organization</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
                                            </div>
                                        </div>

                                        {formData.organizationType === 'Other Organization' && (
                                            <div>
                                                <label className="block text-sm font-bold text-on-surface mb-2">Specify Organization Type</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="e.g., Government Organization"
                                                        value={formData.customOrganizationType}
                                                        onFocus={() => {
                                                            setActiveFieldFocused('customOrganizationType');
                                                            if (matchingOrders.length > 0) setShowSuggestions(true);
                                                        }}
                                                        onChange={(e) => handleFieldChange('customOrganizationType', e.target.value)}
                                                        className={`w-full bg-surface border px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.customOrganizationType ? 'border-error' : 'border-outline-variant'}`}
                                                    />
                                                    {renderSuggestionsDropdown('customOrganizationType')}
                                                </div>
                                                {formErrors.customOrganizationType && <p className="text-error text-xs mt-1">{formErrors.customOrganizationType}</p>}
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Organization Name</label>
                                                {isSearchingOrder && activeFieldFocused === 'organizationName' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., Mediciti Core"
                                                    value={formData.organizationName}
                                                    onFocus={() => {
                                                        setActiveFieldFocused('organizationName');
                                                        if (matchingOrders.length > 0) setShowSuggestions(true);
                                                    }}
                                                    onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                                                    className={`w-full bg-surface border px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.organizationName ? 'border-error' : 'border-outline-variant'}`}
                                                />
                                                {renderSuggestionsDropdown('organizationName')}
                                            </div>
                                            {formErrors.organizationName && <p className="text-error text-xs mt-1">{formErrors.organizationName}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Registration Number</label>
                                                {isSearchingOrder && activeFieldFocused === 'registrationNumber' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., NMC-459921"
                                                    value={formData.registrationNumber}
                                                    onFocus={() => {
                                                        setActiveFieldFocused('registrationNumber');
                                                        if (matchingOrders.length > 0) setShowSuggestions(true);
                                                    }}
                                                    onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                                                    className={`w-full bg-surface border px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.registrationNumber ? 'border-error' : 'border-outline-variant'}`}
                                                />
                                                {renderSuggestionsDropdown('registrationNumber')}
                                            </div>
                                            {formErrors.registrationNumber && <p className="text-error text-xs mt-1">{formErrors.registrationNumber}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Address / Location</label>
                                                {isSearchingOrder && activeFieldFocused === 'address' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant text-[20px]">location_on</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., Bhaisepati, Lalitpur"
                                                    value={formData.address}
                                                    onFocus={() => {
                                                        setActiveFieldFocused('address');
                                                        if (matchingOrders.length > 0) setShowSuggestions(true);
                                                    }}
                                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                                    className={`w-full bg-surface border pl-12 pr-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.address ? 'border-error' : 'border-outline-variant'}`}
                                                />
                                                {renderSuggestionsDropdown('address')}
                                            </div>
                                            {formErrors.address && <p className="text-error text-xs mt-1">{formErrors.address}</p>}
                                        </div>
                                        
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Admin Full Name</label>
                                                {isSearchingOrder && activeFieldFocused === 'adminFullName' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="e.g., Dr. Ramesh Sharma"
                                                    value={formData.adminFullName}
                                                    onFocus={() => {
                                                        setActiveFieldFocused('adminFullName');
                                                        if (matchingOrders.length > 0) setShowSuggestions(true);
                                                    }}
                                                    onChange={(e) => handleFieldChange('adminFullName', e.target.value)}
                                                    className={`w-full bg-surface border px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.adminFullName ? 'border-error' : 'border-outline-variant'}`}
                                                />
                                                {renderSuggestionsDropdown('adminFullName')}
                                            </div>
                                            {formErrors.adminFullName && <p className="text-error text-xs mt-1">{formErrors.adminFullName}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Primary Admin Email</label>
                                                {isSearchingOrder && activeFieldFocused === 'adminEmail' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-2.5 text-on-surface-variant text-[20px]">mail</span>
                                                <input 
                                                    type="email" 
                                                    placeholder="e.g., admin@mediciti.com"
                                                    value={formData.adminEmail}
                                                    onFocus={() => {
                                                        setActiveFieldFocused('adminEmail');
                                                        if (matchingOrders.length > 0) setShowSuggestions(true);
                                                    }}
                                                    onChange={(e) => handleFieldChange('adminEmail', e.target.value)}
                                                    className={`w-full bg-surface border pl-12 pr-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.adminEmail ? 'border-error' : 'border-outline-variant'}`}
                                                />
                                                {renderSuggestionsDropdown('adminEmail')}
                                            </div>
                                            {formErrors.adminEmail && <p className="text-error text-xs mt-1">{formErrors.adminEmail}</p>}
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-on-surface">Admin Phone</label>
                                                {isSearchingOrder && activeFieldFocused === 'adminPhone' && (
                                                    <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px] animate-spin">refresh</span>
                                                        Searching database...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <div className="relative group">
                                                    <div className="absolute left-[1px] top-[1px] bottom-[1px] flex items-center border-r border-outline-variant pr-2 pl-3 bg-surface-container-low rounded-l-[11px] pointer-events-auto z-10">
                                                        <select 
                                                            value={formData.adminPhoneCode}
                                                            onChange={(e) => setFormData({...formData, adminPhoneCode: e.target.value})}
                                                            className="bg-transparent border-none outline-none p-0 pr-4 text-[14px] text-on-surface-variant font-medium cursor-pointer appearance-none focus:ring-0" style={{backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23737686' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.2em 1.2em"}}
                                                        >
                                                            <option value="+1">🇺🇸 +1</option>
                                                            <option value="+44">🇬🇧 +44</option>
                                                            <option value="+91">🇮🇳 +91</option>
                                                            <option value="+61">🇦🇺 +61</option>
                                                            <option value="+977">🇳🇵 +977</option>
                                                        </select>
                                                    </div>
                                                    <input 
                                                        type="tel" 
                                                        maxLength={10}
                                                        placeholder="0000000000"
                                                        value={formData.adminPhone}
                                                        onFocus={() => {
                                                            setActiveFieldFocused('adminPhone');
                                                            if (matchingOrders.length > 0) setShowSuggestions(true);
                                                        }}
                                                        onChange={(e) => handleFieldChange('adminPhone', e.target.value.replace(/[^0-9]/g, ''))}
                                                        className={`w-full bg-surface border pl-[95px] pr-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow ${formErrors.adminPhone ? 'border-error' : 'border-outline-variant'}`}
                                                    />
                                                </div>
                                                {renderSuggestionsDropdown('adminPhone')}
                                            </div>
                                            {formErrors.adminPhone && <p className="text-error text-xs mt-1">{formErrors.adminPhone}</p>}
                                        </div>
                                    </section>
                                    
                                    {/* Section 2: Workspace Configuration */}
                                    <section className="space-y-5 mb-8">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Workspace Configuration</h3>
                                        

                                        
                                        <div>
                                            <label className="block text-sm font-bold text-on-surface mb-2">Select Subscription Tier</label>
                                            <div className="relative">
                                                <select 
                                                    value={formData.subscriptionTier}
                                                    onChange={(e) => setFormData({...formData, subscriptionTier: e.target.value})}
                                                    className="w-full appearance-none bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-body-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer"
                                                >
                                                    <option value="Starter (Up to 5 Providers)">Starter (Up to 5 Providers)</option>
                                                    <option value="Professional (Up to 20 Providers)">Professional (Up to 20 Providers)</option>
                                                    <option value="Enterprise (Unlimited Providers)">Enterprise (Unlimited Providers)</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 top-2.5 pointer-events-none text-on-surface-variant">expand_more</span>
                                            </div>
                                        </div>
                                    </section>
                                    
                                    {/* Section 3: Security Policies */}
                                    <section className="space-y-5">
                                        <h3 className="text-sm font-bold text-primary border-b border-surface-container pb-2">Security Policies</h3>
                                        
                                        <div className="space-y-4">
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                                onClick={() => setEnforce2FA(!enforce2FA)}
                                            >
                                                <span className="text-sm font-semibold text-primary">Enforce 2FA for Organization Admin</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-inner ${enforce2FA ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enforce2FA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                            
                                            <div 
                                                className="flex items-center justify-between p-4 border border-outline-variant rounded-lg bg-surface hover:bg-surface-variant/20 transition-colors cursor-pointer"
                                                onClick={() => setRequireHIPAA(!requireHIPAA)}
                                            >
                                                <span className="text-sm font-semibold text-primary">Require HIPAA/Medical Data Compliance Mode</span>
                                                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-inner ${requireHIPAA ? 'bg-emerald-500' : 'bg-outline-variant/30'}`}>
                                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requireHIPAA ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className={`transition-all duration-300 ${currentStep === 2 ? 'relative translate-x-0 opacity-100' : 'absolute top-0 left-0 translate-x-full opacity-0 w-full'}`}>
                                    <section className="space-y-6">
                                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-surface-container px-5 py-4 border-b border-outline-variant flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-on-surface-variant">mark_email_read</span>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-on-surface">Secure Magic Link Invitation</h4>
                                                        <p className="text-xs text-on-surface-variant">To: admin@mediciti.com</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="text-center space-y-3">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                        <span className="material-symbols-outlined text-primary text-3xl">key</span>
                                                    </div>
                                                    <h3 className="font-bold text-primary text-lg">Activate Your OmniBook Enterprise Workspace</h3>
                                                    <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                                                        Welcome to OmniBook. You have been invited to set up the root administrator account for <strong>Mediciti Core</strong>.
                                                    </p>
                                                    
                                                    <div className="inline-block mt-4 w-full max-w-[250px]">
                                                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm shadow-sm pointer-events-none">
                                                            Activate My Workspace
                                                        </button>
                                                        <p className="text-[10px] text-on-surface-variant mt-2 text-center">
                                                            This secure link expires in exactly 48 hours.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-primary mb-2">Optional Custom Note</label>
                                            <textarea 
                                                placeholder="Add a personalized message for the organization director..."
                                                className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none h-24"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                                            <span className="material-symbols-outlined text-blue-600">verified_user</span>
                                            <div>
                                                <h4 className="text-xs font-bold text-blue-900">Enterprise Tenant Provisioning</h4>
                                                <p className="text-[11px] text-blue-800 mt-1">
                                                    Clicking Dispatch will immediately generate a unique UUID for this tenant, spin up an isolated postgres schema, and email the 48-hour secure JWT token link.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                        
                        {/* Drawer Footer (Sticky) */}
                        <div className="px-6 py-5 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-3">
                            {currentStep === 2 && (
                                <button 
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors text-on-surface-variant border border-outline-variant"
                                    disabled={isDispatching}
                                >
                                    Back
                                </button>
                            )}
                            
                            {currentStep === 1 ? (
                                <button 
                                    onClick={() => {
                                        if (validateStep1()) setCurrentStep(2);
                                    }}
                                    className="flex-1 bg-primary text-on-primary px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Continue to Dispatch Invite
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={async () => {
                                        setIsDispatching(true);
                                        try {
                                            const token = localStorage.getItem('token');
                                            const finalOrgType = formData.organizationType === 'Other Organization' ? formData.customOrganizationType : formData.organizationType;
                                            const response = await axios.post('http://localhost:8080/api/v1/superadmin/tenants', {
                                                organizationType: finalOrgType,
                                                organizationName: formData.organizationName,
                                                registrationNumber: formData.registrationNumber,
                                                adminEmail: formData.adminEmail,
                                                adminFullName: formData.adminFullName,
                                                adminPhone: formData.adminPhoneCode + formData.adminPhone,
                                                address: formData.address,
                                                subscriptionTier: formData.subscriptionTier.split(' ')[0],
                                                enforce2FA: enforce2FA,
                                                requireHIPAA: requireHIPAA
                                            }, {
                                                headers: {
                                                    Authorization: `Bearer ${token}`
                                                }
                                            });
                                            if (response.status === 200) {
                                                setSuccessMessage('Secure Invite Dispatched to root admin! Tenant provisioned successfully.');
                                                setIsDrawerOpen(false);
                                                setCurrentStep(1);
                                                setFormData({ organizationType: 'Clinic', customOrganizationType: '', organizationName: '', registrationNumber: '', adminFullName: '', adminEmail: '', adminPhoneCode: '+1', adminPhone: '', address: '', subscriptionTier: 'Enterprise (Unlimited Providers)' });
                                                fetchActivities(); // Refresh list after adding
                                            } else {
                                                setErrorMessage('Failed to dispatch invite.');
                                            }
                                        } catch (error: any) {
                                            setErrorMessage(error.response?.data?.message || 'Error communicating with server.');
                                        } finally {
                                            setIsDispatching(false);
                                        }
                                    }}
                                    disabled={isDispatching}
                                    className="flex-1 bg-primary text-on-primary px-6 py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDispatching ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                                            Provisioning...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                            Generate & Dispatch Secure Invite
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Financial Report Modal */}
            {isReportModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center font-sans">
                    {/* Dark Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsReportModalOpen(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-sm text-primary font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">request_quote</span>
                                Generate Financial Report
                            </h2>
                            <button 
                                onClick={() => setIsReportModalOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-6 bg-surface">
                            {/* Time Period */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-2">Time Period</label>
                                <div className="relative">
                                    <select 
                                        value={timePeriod}
                                        onChange={(e) => setTimePeriod(e.target.value)}
                                        className="w-full appearance-none bg-surface border border-outline-variant px-4 py-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow cursor-pointer font-medium"
                                    >
                                        <option value="Last 30 Days">Last 30 Days</option>
                                        <option value="This Quarter">This Quarter</option>
                                        <option value="Year to Date">Year to Date</option>
                                        <option value="Last 24 Hours">Last 24 Hours</option>
                                        <option value="Last 7 Days">Last 7 Days</option>
                                        <option value="This Year">This Year</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-4 top-3 pointer-events-none text-on-surface-variant">calendar_today</span>
                                </div>
                            </div>

                            {/* Report Type */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-3">Report Scope</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reportType === 'comprehensive' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:bg-surface-variant/20'}`} onClick={() => setReportType('comprehensive')}>
                                        <input type="radio" name="reportType" checked={reportType === 'comprehensive'} className="mt-1 text-primary focus:ring-primary cursor-pointer" onChange={() => {}} />
                                        <div>
                                            <div className="text-sm font-bold text-on-surface">Comprehensive Ledger</div>
                                            <div className="text-[11px] text-on-surface-variant mt-0.5">Includes platform revenue, all tenant subscription fees, and transaction aggregates.</div>
                                        </div>
                                    </label>
                                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${reportType === 'payouts' ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-surface hover:bg-surface-variant/20'}`} onClick={() => setReportType('payouts')}>
                                        <input type="radio" name="reportType" checked={reportType === 'payouts'} className="mt-1 text-primary focus:ring-primary cursor-pointer" onChange={() => {}} />
                                        <div>
                                            <div className="text-sm font-bold text-on-surface">Tenant Payouts Only</div>
                                            <div className="text-[11px] text-on-surface-variant mt-0.5">Detailed breakdown of clinic disbursements and pending settlements.</div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Export Format */}
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-3">Export Format</label>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setReportFormat('pdf')}
                                        className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportFormat === 'pdf' ? 'bg-primary border-primary text-white shadow-md' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                                        PDF
                                    </button>
                                    <button 
                                        onClick={() => setReportFormat('csv')}
                                        className={`flex-1 py-2.5 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition-all ${reportFormat === 'csv' ? 'bg-primary border-primary text-white shadow-md' : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/30'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>table</span>
                                        CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-surface-container bg-surface-container-lowest flex justify-end gap-3">
                            <button 
                                onClick={() => setIsReportModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg font-bold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    setIsGenerating(true);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const response = await axios.get(`http://localhost:8080/api/v1/superadmin/reports/financial`, {
                                            params: {
                                                timePeriod,
                                                reportType,
                                                format: reportFormat
                                            },
                                            headers: { Authorization: `Bearer ${token}` },
                                            responseType: 'blob'
                                        });
                                        
                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                        const link = document.createElement('link');
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.setAttribute('download', `financial-report-${reportType}.${reportFormat}`);
                                        document.body.appendChild(a);
                                        a.click();
                                        a.parentNode?.removeChild(a);
                                        
                                        setIsReportModalOpen(false);
                                    } catch (error) {
                                        alert('Failed to generate report.');
                                    } finally {
                                        setIsGenerating(false);
                                    }
                                }}
                                disabled={isGenerating}
                                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        Generate & Download
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Audit Logs Drawer */}
            {isAuditDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end font-sans">
                    {/* Dark Background Overlay */}
                    <div 
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        onClick={() => setIsAuditDrawerOpen(false)}
                    ></div>
                    
                    {/* Right-Side Drawer Panel */}
                    <div className="relative w-full max-w-[35%] h-full bg-surface shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-container bg-surface-container-lowest">
                            <h2 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">manage_search</span>
                                Audit Logs Viewer
                            </h2>
                            <button 
                                onClick={() => setIsAuditDrawerOpen(false)}
                                className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-full hover:bg-error-container"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-surface custom-scrollbar">
                            <GlobalAuditLogs />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {successMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-md w-full border border-green-500/30 text-center flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-green-500"></div>
                        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <span className="material-symbols-outlined text-[40px]">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-black text-on-surface mb-2">Success!</h3>
                        <p className="text-on-surface-variant font-medium text-base mb-8 leading-relaxed">
                            {successMessage}
                        </p>
                        <button 
                            className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold tracking-wide shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all active:scale-[0.98]"
                            onClick={() => setSuccessMessage('')}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorMessage && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface p-8 rounded-3xl shadow-2xl max-w-md w-full border border-error/30 text-center flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-error"></div>
                        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-error/20 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                            <span className="material-symbols-outlined text-[40px]">error</span>
                        </div>
                        <h3 className="text-2xl font-black text-on-surface mb-2">Operation Failed</h3>
                        <p className="text-on-surface-variant font-medium text-base mb-8 leading-relaxed">
                            {errorMessage}
                        </p>
                        <button 
                            className="w-full py-3.5 rounded-xl bg-error text-white font-bold tracking-wide shadow-lg shadow-error/20 hover:bg-red-600 transition-all active:scale-[0.98]"
                            onClick={() => setErrorMessage('')}
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
