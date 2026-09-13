import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import { normalizeOrgType } from '../../utils/organizationTerms';

type SettingTabName = 'General Preferences' | 'Gateway Integrations' | 'Security Policies' | 'Billing & Subscriptions';

interface PlatformInvoiceDTO {
    id: number;
    invoiceNumber: string;
    orderNumber?: string;
    organizationName?: string;
    organizationType?: string;
    registrationNumber?: string;
    address?: string;
    adminFullName?: string;
    adminEmail?: string;
    adminPhone?: string;
    invoiceDate: string;
    amount: number;
    currency: string;
    status: string;
    planName: string;
    billingPeriod: string;
    billingCycle?: string;
    paymentMethod?: string;
    verificationStatus?: string;
    transactionId?: string;
    refundId?: string;
    refundReason?: string;
    refundedAt?: string;
}

interface PlatformSettingDTO {
    platformName: string;
    baseTimezone: string;
    systemCurrency: string;
    isWhiteGloveEnabled: boolean;
    auditLogRetention: string;

    stripeActive: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    stripeStatus: string;

    esewaActive: boolean;
    esewaMerchantCode: string;
    esewaSecretKey: string;
    esewaEnvironment: string;
    esewaStatus: string;

    twilioActive: boolean;
    twilioAccountSid: string;
    twilioAuthToken: string;
    twilioSenderNumber: string;
    twilioStatus: string;

    sessionTimeoutMinutes: number;
    enforceGlobalMfa: boolean;
    rateLimitRequestsPerMin: number;
    minPasswordLength: number;

    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionAnnualFee: number;
    billingCycle: string;
    nextInvoiceDate: string;
    billingContactEmail: string;
    appointmentCommissionRate?: number;

    activeIntegrationsCount?: number;
    onboardingModeBadge?: string;
    currencyTimezoneBadge?: string;
    systemVersion?: string;

    invoices?: PlatformInvoiceDTO[];
}

interface SubscriptionPlanDTO {
    id?: number;
    name: string;
    displayName: string;
    monthlyPrice: number;
    annualPrice: number;
    description: string;
    features: string[];
    featuresRaw?: string;
    userLimit?: number;
    appointmentLimit?: number;
    active: boolean;
    isPopular?: boolean;
    displayOrder?: number;
}

interface SuperadminSubscriptionTenantDTO {
    id?: number;
    tenantId?: number;
    name?: string;
    organizationName?: string;
    organizationType?: string;
    registrationNumber: string;
    contactEmail?: string;
    contactPhone?: string;
    adminEmail?: string;
    adminName?: string;
    subscriptionTier?: string;
    planTier?: string;
    billingCycle: string;
    subscriptionStatus: string;
    tenantStatus?: string;
    subscriptionStartDate?: string;
    startDate?: string;
    subscriptionExpiryDate?: string;
    expiryDate?: string;
    remainingDays?: number;
    daysRemaining?: number;
    mrrContribution?: number;
    currentMrr?: number;
    lastPaymentAmount?: number;
    lastPaidAmount?: number;
    lastPaymentDate?: string;
    lastSuspendedReason?: string;
    emergencyExtensionDays?: number;
    hasPendingExtension?: boolean;
    active?: boolean;
}

interface SubscriptionExtensionRequestDTO {
    id: number;
    tenantId: number;
    tenantName?: string;
    organizationName?: string;
    organizationType?: string;
    registrationNumber?: string;
    phone?: string;
    requestedDays: number;
    reason: string;
    status: string;
    requestedBy?: string;
    requestedByName?: string;
    requestedByEmail?: string;
    reviewedBy?: string;
    processedByName?: string;
    processedByEmail?: string;
    reviewedAt?: string;
    processedAt?: string;
    previousExpiryDate?: string;
    newExpiryDate?: string;
    approvedDays?: number;
    adminNotes?: string;
    createdAt?: string;
    currentPlan?: string;
    currentPlanTier?: string;
    currentExpiryDate?: string;
}

export default function SuperAdminSetting() {
    const [activeTab, setActiveTab] = useState<SettingTabName>('General Preferences');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Platform settings state
    const [settings, setSettings] = useState<PlatformSettingDTO>({
        platformName: 'OmniBook Enterprise',
        baseTimezone: 'Asia/Kathmandu',
        systemCurrency: 'NPR',
        isWhiteGloveEnabled: true,
        auditLogRetention: '7 Years',

        stripeActive: true,
        stripePublishableKey: 'pk_test_51OmniBookLiveStripeKeyExample',
        stripeSecretKey: 'sk_test_••••••••••••••••••••••••',
        stripeWebhookSecret: 'whsec_••••••••••••••••••••••••',
        stripeStatus: 'Active • v2.1.0 • Webhook responding',

        esewaActive: true,
        esewaMerchantCode: 'EPAYTEST',
        esewaSecretKey: '8gBm/:&EnhH.1/q',
        esewaEnvironment: 'TEST',
        esewaStatus: 'Active • v2.0.1 • Regional Default',

        twilioActive: true,
        twilioAccountSid: 'AC••••••••••••••••••••••••••••••••',
        twilioAuthToken: '••••••••••••••••••••••••••••••••',
        twilioSenderNumber: '+15005550006',
        twilioStatus: 'Active • 98.4% Delivery Rate',

        sessionTimeoutMinutes: 15,
        enforceGlobalMfa: true,
        rateLimitRequestsPerMin: 1000,
        minPasswordLength: 8,

        subscriptionTier: 'Enterprise License',
        subscriptionStatus: 'ACTIVE',
        subscriptionAnnualFee: 4999.00,
        billingCycle: 'Annually',
        nextInvoiceDate: 'Oct 1, 2026',
        billingContactEmail: 'billing@omnibook.com',

        invoices: []
    });

    // Gateway Modal State
    const [activeGatewayModal, setActiveGatewayModal] = useState<'stripe' | 'esewa' | 'twilio' | null>(null);
    const [gatewayForm, setGatewayForm] = useState<any>({});
    const [gatewayTestStatus, setGatewayTestStatus] = useState<string>('');

    // Billing Manage Modal State
    const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
    const [billingForm, setBillingForm] = useState<{ email: string; tier: string; fee: number }>({
        email: '',
        tier: '',
        fee: 4999
    });

    // Invoice Actions State
    const [searchParams] = useSearchParams();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [detailModalInvoice, setDetailModalInvoice] = useState<PlatformInvoiceDTO | null>(null);
    const [deleteConfirmInvoice, setDeleteConfirmInvoice] = useState<PlatformInvoiceDTO | null>(null);
    const [isDeletingInvoice, setIsDeletingInvoice] = useState<boolean>(false);
    const [sendingUpdateInvoiceId, setSendingUpdateInvoiceId] = useState<number | null>(null);
    const [emailSuccessSentIds, setEmailSuccessSentIds] = useState<number[]>([]);
    const [rejectModalInvoice, setRejectModalInvoice] = useState<PlatformInvoiceDTO | null>(null);
    const [rejectReasonCategory, setRejectReasonCategory] = useState<string>('Invalid or Incomplete Organization Credentials');
    const [rejectCustomReason, setRejectCustomReason] = useState<string>('');
    const [isProcessingRefund, setIsProcessingRefund] = useState<boolean>(false);

    // Subscription & Billing Management States
    const [billingSubTab, setBillingSubTab] = useState<'plans' | 'commission' | 'tenants' | 'extensions' | 'invoices'>('plans');
    const [plansList, setPlansList] = useState<SubscriptionPlanDTO[]>([]);
    const [tenantSubs, setTenantSubs] = useState<SuperadminSubscriptionTenantDTO[]>([]);
    const [extensionRequests, setExtensionRequests] = useState<SubscriptionExtensionRequestDTO[]>([]);
    const [commissionRate, setCommissionRate] = useState<number>(10.0);
    const [isSavingCommission, setIsSavingCommission] = useState<boolean>(false);
    
    // Plan Modal State
    const [planModalOpen, setPlanModalOpen] = useState<boolean>(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDTO | null>(null);
    const [planForm, setPlanForm] = useState<SubscriptionPlanDTO>({
        name: '',
        displayName: '',
        monthlyPrice: 2000,
        annualPrice: 20400,
        description: '',
        features: [],
        featuresRaw: '',
        userLimit: 3,
        appointmentLimit: 100,
        active: true,
        isPopular: false,
        displayOrder: 1
    });

    // Tenant Suspend / Extend Modal State
    const [suspendModalTenant, setSuspendModalTenant] = useState<SuperadminSubscriptionTenantDTO | null>(null);
    const [suspendReason, setSuspendReason] = useState<string>('');
    const [extendModalTenant, setExtendModalTenant] = useState<SuperadminSubscriptionTenantDTO | null>(null);
    const [extendDays, setExtendDays] = useState<number>(14);
    const [extendReason, setExtendReason] = useState<string>('Emergency Administrative Grace Period');
    const [isSubmittingTenantAction, setIsSubmittingTenantAction] = useState<boolean>(false);

    // Tenant Directory Filter & Sort States
    const [tenantSearchQuery, setTenantSearchQuery] = useState<string>('');
    const [tenantStatusFilter, setTenantStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'SUSPENDED'>('ALL');
    const [tenantPlanFilter, setTenantPlanFilter] = useState<string>('ALL');
    const [tenantCycleFilter, setTenantCycleFilter] = useState<string>('ALL');
    const [tenantOrgTypeFilter, setTenantOrgTypeFilter] = useState<string>('ALL');
    const [tenantSortBy, setTenantSortBy] = useState<'days_asc' | 'days_desc' | 'mrr_desc' | 'name_asc'>('days_asc');

    const getOrgTypeBadge = (rawType?: string) => {
        const norm = normalizeOrgType(rawType);
        switch (norm) {
            case 'College':
                return {
                    label: rawType || 'College',
                    icon: 'school',
                    className: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                };
            case 'Saloon':
                return {
                    label: rawType || 'Salon',
                    icon: 'content_cut',
                    className: 'bg-amber-50 text-amber-800 border-amber-200'
                };
            case 'Clinic':
                return {
                    label: rawType || 'Clinic',
                    icon: 'medical_services',
                    className: 'bg-teal-50 text-teal-800 border-teal-200'
                };
            default:
                return {
                    label: rawType || 'Organization',
                    icon: 'apartment',
                    className: 'bg-slate-100 text-slate-700 border-slate-200'
                };
        }
    };

    const countActiveTenants = useMemo(() => tenantSubs.filter(t => (t.subscriptionStatus || 'ACTIVE') === 'ACTIVE').length, [tenantSubs]);
    const countExpiringSoonTenants = useMemo(() => tenantSubs.filter(t => (t.subscriptionStatus || '') === 'EXPIRING_SOON').length, [tenantSubs]);
    const countExpiredTenants = useMemo(() => tenantSubs.filter(t => (t.subscriptionStatus || '') === 'EXPIRED').length, [tenantSubs]);
    const countSuspendedTenants = useMemo(() => tenantSubs.filter(t => (t.subscriptionStatus || '') === 'SUSPENDED').length, [tenantSubs]);

    const filteredTenantSubs = useMemo(() => {
        return tenantSubs.filter(t => {
            const orgName = (t.organizationName || t.name || '').toLowerCase();
            const pan = (t.registrationNumber || '').toLowerCase();
            const email = (t.adminEmail || '').toLowerCase();
            const query = tenantSearchQuery.trim().toLowerCase();

            if (query && !orgName.includes(query) && !pan.includes(query) && !email.includes(query)) {
                return false;
            }

            const status = t.subscriptionStatus || 'ACTIVE';
            if (tenantStatusFilter !== 'ALL' && status !== tenantStatusFilter) {
                return false;
            }

            const plan = (t.planTier || t.subscriptionTier || 'Starter').toUpperCase();
            if (tenantPlanFilter !== 'ALL' && plan !== tenantPlanFilter.toUpperCase()) {
                return false;
            }

            const cycle = (t.billingCycle || 'Monthly').toUpperCase();
            if (tenantCycleFilter !== 'ALL' && cycle !== tenantCycleFilter.toUpperCase()) {
                return false;
            }

            const normType = normalizeOrgType(t.organizationType);
            if (tenantOrgTypeFilter !== 'ALL' && normType !== tenantOrgTypeFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            const daysA = a.daysRemaining !== undefined ? a.daysRemaining : (a.remainingDays !== undefined ? a.remainingDays : 9999);
            const daysB = b.daysRemaining !== undefined ? b.daysRemaining : (b.remainingDays !== undefined ? b.remainingDays : 9999);
            const mrrA = a.currentMrr ?? a.mrrContribution ?? 0;
            const mrrB = b.currentMrr ?? b.mrrContribution ?? 0;
            const nameA = (a.organizationName || a.name || '').toLowerCase();
            const nameB = (b.organizationName || b.name || '').toLowerCase();

            if (tenantSortBy === 'days_asc') return daysA - daysB;
            if (tenantSortBy === 'days_desc') return daysB - daysA;
            if (tenantSortBy === 'mrr_desc') return mrrB - mrrA;
            if (tenantSortBy === 'name_asc') return nameA.localeCompare(nameB);
            return 0;
        });
    }, [tenantSubs, tenantSearchQuery, tenantStatusFilter, tenantPlanFilter, tenantCycleFilter, tenantOrgTypeFilter, tenantSortBy]);

    // Emergency Extension Requests Filter & Sort States
    const [extSearchQuery, setExtSearchQuery] = useState<string>('');
    const [extStatusFilter, setExtStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
    const [extOrgTypeFilter, setExtOrgTypeFilter] = useState<string>('ALL');
    const [extPlanFilter, setExtPlanFilter] = useState<string>('ALL');
    const [extSortBy, setExtSortBy] = useState<'created_desc' | 'created_asc' | 'days_desc' | 'days_asc' | 'name_asc'>('created_desc');

    const countPendingExt = useMemo(() => extensionRequests.filter(r => (r.status || 'PENDING') === 'PENDING').length, [extensionRequests]);
    const countApprovedExt = useMemo(() => extensionRequests.filter(r => r.status === 'APPROVED').length, [extensionRequests]);
    const countRejectedExt = useMemo(() => extensionRequests.filter(r => r.status === 'REJECTED').length, [extensionRequests]);

    const filteredExtensionRequests = useMemo(() => {
        return extensionRequests.filter(req => {
            const orgName = (req.organizationName || req.tenantName || '').toLowerCase();
            const pan = (req.registrationNumber || '').toLowerCase();
            const requester = (req.requestedByName || req.requestedBy || req.requestedByEmail || '').toLowerCase();
            const query = extSearchQuery.trim().toLowerCase();

            if (query && !orgName.includes(query) && !pan.includes(query) && !requester.includes(query)) {
                return false;
            }

            const status = req.status || 'PENDING';
            if (extStatusFilter !== 'ALL' && status !== extStatusFilter) {
                return false;
            }

            const plan = (req.currentPlan || req.currentPlanTier || 'Starter').toUpperCase();
            if (extPlanFilter !== 'ALL' && plan !== extPlanFilter.toUpperCase()) {
                return false;
            }

            const normType = normalizeOrgType(req.organizationType);
            if (extOrgTypeFilter !== 'ALL' && normType !== extOrgTypeFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const daysA = a.requestedDays || 0;
            const daysB = b.requestedDays || 0;
            const nameA = (a.organizationName || a.tenantName || '').toLowerCase();
            const nameB = (b.organizationName || b.tenantName || '').toLowerCase();

            if (extSortBy === 'created_desc') return dateB - dateA;
            if (extSortBy === 'created_asc') return dateA - dateB;
            if (extSortBy === 'days_desc') return daysB - daysA;
            if (extSortBy === 'days_asc') return daysA - daysB;
            if (extSortBy === 'name_asc') return nameA.localeCompare(nameB);
            return 0;
        });
    }, [extensionRequests, extSearchQuery, extStatusFilter, extPlanFilter, extOrgTypeFilter, extSortBy]);

    // Extension Review Modal State
    const [reviewModalRequest, setReviewModalRequest] = useState<SubscriptionExtensionRequestDTO | null>(null);
    const [reviewApproved, setReviewApproved] = useState<boolean>(true);
    const [reviewApprovedDays, setReviewApprovedDays] = useState<number>(14);
    const [reviewNotes, setReviewNotes] = useState<string>('');
    const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
    const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);

    // ==========================================
    // Dynamic Pagination States for Settings Tables
    // ==========================================
    // 1. Tenant Subscriptions Pagination
    const [tenantCurrentPage, setTenantCurrentPage] = useState<number>(1);
    const [tenantPageSize, setTenantPageSize] = useState<number>(10);

    useEffect(() => {
        setTenantCurrentPage(1);
    }, [tenantSearchQuery, tenantStatusFilter, tenantPlanFilter, tenantCycleFilter, tenantOrgTypeFilter, tenantSortBy, tenantPageSize]);

    const tenantTotalEntries = filteredTenantSubs.length;
    const tenantTotalPages = Math.max(1, Math.ceil(tenantTotalEntries / tenantPageSize));
    const tenantSafeCurrentPage = Math.min(tenantCurrentPage, tenantTotalPages);
    const tenantStartIndex = tenantTotalEntries === 0 ? 0 : (tenantSafeCurrentPage - 1) * tenantPageSize;
    const tenantEndIndex = Math.min(tenantStartIndex + tenantPageSize, tenantTotalEntries);
    const paginatedTenantSubs = filteredTenantSubs.slice(tenantStartIndex, tenantEndIndex);

    const getTenantPageNumbers = () => {
        if (tenantTotalPages <= 5) {
            return Array.from({ length: tenantTotalPages }, (_, i) => i + 1);
        }
        let start = Math.max(1, tenantSafeCurrentPage - 2);
        let end = Math.min(tenantTotalPages, start + 4);
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // 2. Emergency Subscription Extensions Pagination
    const [extCurrentPage, setExtCurrentPage] = useState<number>(1);
    const [extPageSize, setExtPageSize] = useState<number>(10);

    useEffect(() => {
        setExtCurrentPage(1);
    }, [extSearchQuery, extStatusFilter, extPlanFilter, extOrgTypeFilter, extSortBy, extPageSize]);

    const extTotalEntries = filteredExtensionRequests.length;
    const extTotalPages = Math.max(1, Math.ceil(extTotalEntries / extPageSize));
    const extSafeCurrentPage = Math.min(extCurrentPage, extTotalPages);
    const extStartIndex = extTotalEntries === 0 ? 0 : (extSafeCurrentPage - 1) * extPageSize;
    const extEndIndex = Math.min(extStartIndex + extPageSize, extTotalEntries);
    const paginatedExtensionRequests = filteredExtensionRequests.slice(extStartIndex, extEndIndex);

    const getExtPageNumbers = () => {
        if (extTotalPages <= 5) {
            return Array.from({ length: extTotalPages }, (_, i) => i + 1);
        }
        let start = Math.max(1, extSafeCurrentPage - 2);
        let end = Math.min(extTotalPages, start + 4);
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // 3. Subscription Invoices & Verification Pagination
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>('');
    const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');
    const [invoiceCurrentPage, setInvoiceCurrentPage] = useState<number>(1);
    const [invoicePageSize, setInvoicePageSize] = useState<number>(10);

    const filteredInvoices = useMemo(() => {
        return (settings.invoices || []).filter(inv => {
            let statusMatch = true;
            if (invoiceStatusFilter !== 'ALL') {
                statusMatch = (inv.status || '').toUpperCase() === invoiceStatusFilter;
            }
            let searchMatch = true;
            if (invoiceSearchQuery.trim()) {
                const q = invoiceSearchQuery.toLowerCase();
                searchMatch = Boolean(
                    (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
                    (inv.organizationName && inv.organizationName.toLowerCase().includes(q)) ||
                    (inv.adminEmail && inv.adminEmail.toLowerCase().includes(q)) ||
                    (inv.planName && inv.planName.toLowerCase().includes(q)) ||
                    (inv.paymentMethod && inv.paymentMethod.toLowerCase().includes(q)) ||
                    (inv.status && inv.status.toLowerCase().includes(q))
                );
            }
            return statusMatch && searchMatch;
        });
    }, [settings.invoices, invoiceStatusFilter, invoiceSearchQuery]);

    useEffect(() => {
        setInvoiceCurrentPage(1);
    }, [invoiceSearchQuery, invoiceStatusFilter, invoicePageSize]);

    const invoiceTotalEntries = filteredInvoices.length;
    const invoiceTotalPages = Math.max(1, Math.ceil(invoiceTotalEntries / invoicePageSize));
    const invoiceSafeCurrentPage = Math.min(invoiceCurrentPage, invoiceTotalPages);
    const invoiceStartIndex = invoiceTotalEntries === 0 ? 0 : (invoiceSafeCurrentPage - 1) * invoicePageSize;
    const invoiceEndIndex = Math.min(invoiceStartIndex + invoicePageSize, invoiceTotalEntries);
    const paginatedInvoices = filteredInvoices.slice(invoiceStartIndex, invoiceEndIndex);

    const getInvoicePageNumbers = () => {
        if (invoiceTotalPages <= 5) {
            return Array.from({ length: invoiceTotalPages }, (_, i) => i + 1);
        }
        let start = Math.max(1, invoiceSafeCurrentPage - 2);
        let end = Math.min(invoiceTotalPages, start + 4);
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        const pages: number[] = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Toast notification state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3500);
    };

    // Auto-select tab if passed in URL query param (e.g. from notification link)
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const clean = tabParam.trim();
            if (clean === 'Billing & Subscriptions' || clean === 'Billing and Subscriptions' || clean.toLowerCase().includes('billing')) {
                setActiveTab('Billing & Subscriptions');
            } else if (clean === 'General Preferences' || clean === 'Gateway Integrations' || clean === 'Security Policies') {
                setActiveTab(clean as SettingTabName);
            }
        }
    }, [searchParams]);

    // Fetch initial settings from backend
    useEffect(() => {
        fetchSettings();
        fetchPlans();
        fetchTenantSubs();
        fetchExtensionRequests();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/v1/superadmin/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setSettings(response.data);
                if (response.data.appointmentCommissionRate != null) {
                    setCommissionRate(response.data.appointmentCommissionRate);
                }
            }
        } catch (error) {
            console.error('Failed to load superadmin settings:', error);
            showToast('Loaded local fallback settings.', 'info');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/plans', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setPlansList(res.data);
            }
        } catch (err) {
            console.error('Failed to load subscription plans:', err);
        }
    };

    const fetchTenantSubs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/subscriptions/tenants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setTenantSubs(res.data);
            }
        } catch (err) {
            console.error('Failed to load tenant subscriptions:', err);
        }
    };

    const fetchExtensionRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/v1/superadmin/subscriptions/extension-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setExtensionRequests(res.data);
            }
        } catch (err) {
            console.error('Failed to load extension requests:', err);
        }
    };

    const handleSaveCommissionRate = async () => {
        if (commissionRate < 0 || commissionRate > 50) {
            showToast('Commission rate must be between 0% and 50%.', 'error');
            return;
        }
        setIsSavingCommission(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/v1/superadmin/settings/commission-rate', 
                { rate: commissionRate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Platform appointment commission rate updated to ${commissionRate}% successfully!`, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to update commission rate.', 'error');
        } finally {
            setIsSavingCommission(false);
        }
    };

    const handleOpenCreatePlanModal = () => {
        setEditingPlan(null);
        setPlanForm({
            name: '',
            displayName: '',
            monthlyPrice: 2000,
            annualPrice: 20400,
            description: '',
            features: [],
            featuresRaw: 'Feature 1\nFeature 2\nFeature 3',
            userLimit: 3,
            appointmentLimit: 100,
            active: true,
            isPopular: false,
            displayOrder: (plansList.length + 1)
        });
        setPlanModalOpen(true);
    };

    const handleOpenEditPlanModal = (p: SubscriptionPlanDTO) => {
        setEditingPlan(p);
        setPlanForm({
            ...p,
            featuresRaw: p.featuresRaw || (p.features ? p.features.join('\n') : '')
        });
        setPlanModalOpen(true);
    };

    const handleSavePlan = async () => {
        if (!planForm.name || !planForm.name.trim()) {
            showToast('Plan internal identifier is required.', 'error');
            return;
        }
        setIsSavingPlan(true);
        try {
            const token = localStorage.getItem('token');
            if (editingPlan && editingPlan.id) {
                await axios.put(`http://localhost:8080/api/v1/superadmin/plans/${editingPlan.id}`, planForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast(`Plan '${planForm.displayName || planForm.name}' updated successfully!`, 'success');
            } else {
                await axios.post('http://localhost:8080/api/v1/superadmin/plans', planForm, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast(`New Plan '${planForm.displayName || planForm.name}' created successfully!`, 'success');
            }
            setPlanModalOpen(false);
            fetchPlans();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to save subscription plan.', 'error');
        } finally {
            setIsSavingPlan(false);
        }
    };

    const handleTogglePlanStatus = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:8080/api/v1/superadmin/plans/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Plan status toggled successfully.', 'success');
            fetchPlans();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to toggle plan status.', 'error');
        }
    };

    const handleConfirmSuspendTenant = async () => {
        if (!suspendModalTenant) return;
        const tenantId = suspendModalTenant.id ?? suspendModalTenant.tenantId;
        if (!tenantId) return;
        setIsSubmittingTenantAction(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/v1/superadmin/subscriptions/tenants/${tenantId}/suspend`,
                { reason: suspendReason.trim() || 'Suspended by Super Admin' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const clinicName = suspendModalTenant.organizationName || suspendModalTenant.name || 'Tenant';
            showToast(`Subscription for ${clinicName} has been suspended.`, 'success');
            setSuspendModalTenant(null);
            fetchTenantSubs();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to suspend subscription.', 'error');
        } finally {
            setIsSubmittingTenantAction(false);
        }
    };

    const handleConfirmReactivateTenant = async (tenantId: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/v1/superadmin/subscriptions/tenants/${tenantId}/reactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('Subscription reactivated successfully!', 'success');
            fetchTenantSubs();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to reactivate subscription.', 'error');
        }
    };

    const handleConfirmExtendTenant = async () => {
        if (!extendModalTenant) return;
        const tenantId = extendModalTenant.id ?? extendModalTenant.tenantId;
        if (!tenantId) return;
        setIsSubmittingTenantAction(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/v1/superadmin/subscriptions/tenants/${tenantId}/extend`,
                { days: extendDays, reason: extendReason.trim() || 'Administrative extension' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const clinicName = extendModalTenant.organizationName || extendModalTenant.name || 'Tenant';
            showToast(`Extended ${clinicName}'s subscription by ${extendDays} days!`, 'success');
            setExtendModalTenant(null);
            fetchTenantSubs();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to extend subscription.', 'error');
        } finally {
            setIsSubmittingTenantAction(false);
        }
    };

    const handleConfirmReviewExtension = async () => {
        if (!reviewModalRequest) return;
        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/v1/superadmin/subscriptions/extension-requests/${reviewModalRequest.id}/review`,
                {
                    approved: reviewApproved,
                    approvedDays: reviewApproved ? reviewApprovedDays : null,
                    notes: reviewNotes.trim()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showToast(`Extension request ${reviewApproved ? 'Approved' : 'Rejected'} successfully.`, 'success');
            setReviewModalRequest(null);
            fetchExtensionRequests();
            fetchTenantSubs();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to review extension request.', 'error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleSendVerificationUpdate = async (inv: PlatformInvoiceDTO) => {
        if (!inv.id) return;
        if (!inv.adminEmail || !inv.adminEmail.includes('@')) {
            showToast('Cannot dispatch email: No valid administrator email address is recorded for this invoice.', 'error');
            return;
        }

        setSendingUpdateInvoiceId(inv.id);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:8080/api/v1/subscriptions/invoices/${inv.id}/send-verification-update`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data && res.data.success) {
                setEmailSuccessSentIds(prev => [...prev, inv.id]);
                showToast(`Verification update email dispatched successfully to ${inv.adminEmail}!`, 'success');
            } else {
                showToast(res.data?.message || 'Failed to dispatch verification email.', 'error');
            }
        } catch (err: any) {
            console.error('Send verification update error:', err);
            const msg = err.response?.data?.message || 'Could not send verification update email. Please check backend SMTP connectivity.';
            showToast(msg, 'error');
        } finally {
            setSendingUpdateInvoiceId(null);
        }
    };

    const handleOpenRejectModal = (inv: PlatformInvoiceDTO) => {
        setRejectModalInvoice(inv);
        setRejectReasonCategory('Invalid or Incomplete Organization Credentials');
        setRejectCustomReason('');
    };

    const handleConfirmRejectAndRefund = async () => {
        if (!rejectModalInvoice) return;

        const effectiveReason = rejectReasonCategory === 'Other (Specify Custom Reason Below)'
            ? (rejectCustomReason.trim() || 'Subscription request rejected after administrative verification review')
            : (rejectCustomReason.trim() ? `${rejectReasonCategory} - ${rejectCustomReason.trim()}` : rejectReasonCategory);

        setIsProcessingRefund(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:8080/api/v1/subscriptions/invoices/${rejectModalInvoice.id}/reject-and-refund`,
                { reason: effectiveReason },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data && res.data.success) {
                showToast(`Subscription rejected & refunded! Reference: ${res.data.refundId}`, 'success');
                setSettings(prev => ({
                    ...prev,
                    invoices: prev.invoices?.map(inv => {
                        if (inv.id === rejectModalInvoice.id) {
                            return {
                                ...inv,
                                status: 'Refunded',
                                verificationStatus: 'REJECTED',
                                refundId: res.data.refundId,
                                refundReason: res.data.refundReason || effectiveReason,
                                refundedAt: new Date().toISOString()
                            };
                        }
                        return inv;
                    })
                }));
                if (detailModalInvoice && detailModalInvoice.id === rejectModalInvoice.id) {
                    setDetailModalInvoice(prev => prev ? ({
                        ...prev,
                        status: 'Refunded',
                        verificationStatus: 'REJECTED',
                        refundId: res.data.refundId,
                        refundReason: res.data.refundReason || effectiveReason,
                        refundedAt: new Date().toISOString()
                    }) : null);
                }
                setRejectModalInvoice(null);
            } else {
                showToast(res.data?.message || 'Failed to process rejection and refund.', 'error');
            }
        } catch (err: any) {
            console.error('Reject and refund error:', err);
            const msg = err.response?.data?.message || 'Failed to initiate refund. Please check gateway connectivity.';
            showToast(msg, 'error');
        } finally {
            setIsProcessingRefund(false);
        }
    };

    // Save all changes to database
    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:8080/api/v1/superadmin/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setSettings(response.data);
                showToast('Platform configurations saved to database successfully!', 'success');
            }
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            showToast(error.response?.data?.message || 'Failed to save configurations.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Open Gateway Configuration Modal
    const handleOpenGatewayModal = (gateway: 'stripe' | 'esewa' | 'twilio') => {
        setActiveGatewayModal(gateway);
        setGatewayTestStatus('');
        if (gateway === 'stripe') {
            setGatewayForm({
                active: settings.stripeActive,
                publishableKey: settings.stripePublishableKey,
                secretKey: settings.stripeSecretKey,
                webhookSecret: settings.stripeWebhookSecret
            });
        } else if (gateway === 'esewa') {
            setGatewayForm({
                active: settings.esewaActive,
                merchantCode: settings.esewaMerchantCode,
                secretKey: settings.esewaSecretKey,
                environment: settings.esewaEnvironment || 'TEST'
            });
        } else if (gateway === 'twilio') {
            setGatewayForm({
                active: settings.twilioActive,
                accountSid: settings.twilioAccountSid,
                authToken: settings.twilioAuthToken,
                senderNumber: settings.twilioSenderNumber
            });
        }
    };

    // Save Gateway from Modal
    const handleSaveGateway = () => {
        if (activeGatewayModal === 'stripe') {
            setSettings(prev => ({
                ...prev,
                stripeActive: gatewayForm.active,
                stripePublishableKey: gatewayForm.publishableKey,
                stripeSecretKey: gatewayForm.secretKey,
                stripeWebhookSecret: gatewayForm.webhookSecret,
                stripeStatus: gatewayForm.active ? 'Active • v2.1.0 • Webhook responding' : 'Inactive • Disabled by Admin'
            }));
        } else if (activeGatewayModal === 'esewa') {
            setSettings(prev => ({
                ...prev,
                esewaActive: gatewayForm.active,
                esewaMerchantCode: gatewayForm.merchantCode,
                esewaSecretKey: gatewayForm.secretKey,
                esewaEnvironment: gatewayForm.environment,
                esewaStatus: gatewayForm.active 
                    ? (gatewayForm.environment === 'LIVE' ? 'Active • v2.0.1 • Production Live' : 'Active • v2.0.1 • Regional Sandbox') 
                    : 'Inactive • Disabled by Admin'
            }));
        } else if (activeGatewayModal === 'twilio') {
            setSettings(prev => ({
                ...prev,
                twilioActive: gatewayForm.active,
                twilioAccountSid: gatewayForm.accountSid,
                twilioAuthToken: gatewayForm.authToken,
                twilioSenderNumber: gatewayForm.senderNumber,
                twilioStatus: gatewayForm.active ? 'Active • 98.4% Delivery Rate' : 'Inactive • Disabled by Admin'
            }));
        }
        showToast(`${activeGatewayModal?.toUpperCase()} configuration updated! Click "Save Changes" to persist.`, 'success');
        setActiveGatewayModal(null);
    };

    // Open Billing Modal
    const handleOpenBillingModal = () => {
        setBillingForm({
            email: settings.billingContactEmail || 'billing@omnibook.com',
            tier: settings.subscriptionTier || 'Enterprise License',
            fee: settings.subscriptionAnnualFee || 4999
        });
        setIsBillingModalOpen(true);
    };

    // Save Billing Modal
    const handleSaveBilling = () => {
        setSettings(prev => ({
            ...prev,
            billingContactEmail: billingForm.email,
            subscriptionTier: billingForm.tier,
            subscriptionAnnualFee: billingForm.fee
        }));
        setIsBillingModalOpen(false);
        showToast('Billing profile updated! Click "Save Changes" to persist.', 'success');
    };

    // Confirm Delete Invoice
    const handleConfirmDeleteInvoice = async () => {
        if (!deleteConfirmInvoice) return;
        setIsDeletingInvoice(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/v1/superadmin/settings/invoices/${deleteConfirmInvoice.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(prev => ({
                ...prev,
                invoices: (prev.invoices || []).filter(i => i.id !== deleteConfirmInvoice.id)
            }));
            showToast(`Invoice ${deleteConfirmInvoice.invoiceNumber} deleted successfully.`, 'success');
            setDeleteConfirmInvoice(null);
        } catch (err) {
            console.error('Failed to delete invoice:', err);
            showToast('Failed to delete invoice.', 'error');
        } finally {
            setIsDeletingInvoice(false);
        }
    };

    // Dynamic Invoice PDF Download
    const handleDownloadInvoicePdf = (inv: PlatformInvoiceDTO) => {
        try {
            const doc = new jsPDF();
            
            // Header Brand
            doc.setFillColor(19, 27, 46); // dark navy
            doc.rect(0, 0, 210, 40, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('OmniBook Enterprise', 14, 25);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Global Healthcare & Multi-Tenant Booking Engine', 14, 32);
            
            doc.setFontSize(14);
            doc.text('OFFICIAL INVOICE', 196, 25, { align: 'right' });
            doc.setFontSize(10);
            doc.text(`Status: ${inv.status.toUpperCase()}`, 196, 32, { align: 'right' });

            // Invoice details section
            doc.setTextColor(25, 28, 30);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Billed To (Subscriber):', 14, 52);
            doc.setFont('helvetica', 'normal');
            doc.text(inv.organizationName ? `Organization: ${inv.organizationName}` : 'OmniBook Platform Headquarters', 14, 59);
            if (inv.organizationType) doc.text(`Type: ${inv.organizationType}`, 14, 65);
            if (inv.registrationNumber) doc.text(`PAN / Reg No: ${inv.registrationNumber}`, 14, 71);
            doc.text(`Contact: ${inv.adminFullName ? `${inv.adminFullName} (${inv.adminEmail})` : (inv.adminEmail || settings.billingContactEmail || 'billing@omnibook.com')}`, 14, 77);
            if (inv.address) doc.text(`Address: ${inv.address}`, 14, 83);
            doc.text(`Payment Gateway: ${inv.paymentMethod || 'Credit / Direct Settlement'}`, 14, 89);

            doc.setFont('helvetica', 'bold');
            doc.text('Invoice Details:', 130, 52);
            doc.setFont('helvetica', 'normal');
            doc.text(`Invoice No: ${inv.invoiceNumber}`, 130, 59);
            if (inv.orderNumber) doc.text(`Order No: ${inv.orderNumber}`, 130, 65);
            doc.text(`Issue Date: ${inv.invoiceDate}`, 130, 71);
            doc.text(`Billing Period: ${inv.billingPeriod || 'Annual'}`, 130, 77);
            if (inv.billingCycle) doc.text(`Cycle: ${inv.billingCycle}`, 130, 83);

            const currSymbol = inv.currency === 'NPR' ? 'Rs. ' : (inv.currency === 'USD' ? '$' : `${inv.currency || '$'} `);

            // Table of items
            const tableRows = [
                [
                    '1',
                    inv.planName || (inv.organizationName ? `${inv.organizationName} - Platform Subscription` : 'OmniBook Platform License'),
                    inv.billingPeriod || '1 Subscription Cycle',
                    `${currSymbol}${inv.amount.toLocaleString()}`,
                    `${currSymbol}${inv.amount.toLocaleString()}`
                ]
            ];

            autoTable(doc, {
                startY: 96,
                head: [['#', 'Item & Description', 'Period', 'Unit Price', 'Total']],
                body: tableRows,
                theme: 'striped',
                headStyles: { fillColor: [0, 102, 138], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 5 }
            });

            // Summary calculation
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.setFont('helvetica', 'normal');
            doc.text('Subtotal:', 140, finalY);
            doc.text(`${currSymbol}${inv.amount.toLocaleString()}`, 196, finalY, { align: 'right' });
            
            doc.text('Tax / VAT (0%):', 140, finalY + 6);
            doc.text(`${currSymbol}0`, 196, finalY + 6, { align: 'right' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Total Paid:', 140, finalY + 14);
            doc.text(`${currSymbol}${inv.amount.toLocaleString()}`, 196, finalY + 14, { align: 'right' });

            // Paid stamp
            doc.setDrawColor(46, 125, 50);
            doc.setLineWidth(1);
            doc.roundedRect(14, finalY + 5, 50, 18, 2, 2);
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(12);
            doc.text('PAID IN FULL', 24, finalY + 16);

            // Footer note
            doc.setTextColor(118, 119, 125);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Thank you for choosing OmniBook Enterprise. For billing inquiries, contact support@omnibook.com.', 105, 280, { align: 'center' });

            doc.save(`${inv.invoiceNumber}_OmniBook_Invoice.pdf`);
            showToast(`Downloaded invoice ${inv.invoiceNumber}!`, 'success');
        } catch (error) {
            console.error('PDF generation error:', error);
            showToast('Failed to generate invoice PDF.', 'error');
        }
    };

    // Calculate Dynamic KPIs
    const activeIntegrationsCount = 
        (settings.stripeActive ? 1 : 0) + 
        (settings.esewaActive ? 1 : 0) + 
        (settings.twilioActive ? 1 : 0);

    const baseTimezoneCity = settings.baseTimezone.split('/')[settings.baseTimezone.split('/').length - 1] || settings.baseTimezone;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'General Preferences':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Localization Section */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Localization Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Platform Name</label>
                                    <input 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border" 
                                        type="text" 
                                        value={settings.platformName}
                                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                        placeholder="e.g. OmniBook Enterprise"
                                    />
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Base Timezone</label>
                                    <select 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border"
                                        value={settings.baseTimezone}
                                        onChange={(e) => setSettings({ ...settings, baseTimezone: e.target.value })}
                                    >
                                        <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                                        <option value="UTC+00:00">UTC+00:00 (Universal)</option>
                                        <option value="America/New_York">America/New_York (GMT-5:00)</option>
                                        <option value="Europe/London">Europe/London (GMT+0:00)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GMT+4:00)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9:00)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">System Currency</label>
                                    <select 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border"
                                        value={settings.systemCurrency}
                                        onChange={(e) => setSettings({ ...settings, systemCurrency: e.target.value })}
                                    >
                                        <option value="NPR">NPR - Nepalese Rupee (रू)</option>
                                        <option value="USD">USD - US Dollar ($)</option>
                                        <option value="EUR">EUR - Euro (€)</option>
                                        <option value="GBP">GBP - British Pound (£)</option>
                                        <option value="AUD">AUD - Australian Dollar (A$)</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Onboarding Section */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Onboarding Lifecycle</h2>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant bg-surface-container-lowest">
                                <div className="max-w-lg">
                                    <h4 className="font-bold text-primary flex items-center gap-2">
                                        Enforce White-Glove Onboarding
                                        {settings.isWhiteGloveEnabled && (
                                            <span className="text-[10px] uppercase font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
                                        )}
                                    </h4>
                                    <p className="text-body-md text-on-surface-variant mt-1">When enabled, new clinics cannot self-register and must be manually vetted by a system auditor through the invitation protocol.</p>
                                </div>
                                <button 
                                    onClick={() => setSettings({ ...settings, isWhiteGloveEnabled: !settings.isWhiteGloveEnabled })}
                                    type="button"
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings.isWhiteGloveEnabled ? 'bg-green-600' : 'bg-surface-container-highest'}`}
                                >
                                    <span className={`${settings.isWhiteGloveEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </button>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Compliance & Retention</h2>
                            <div className="max-w-sm">
                                <label className="block font-label-md text-label-md text-outline uppercase mb-2">Medical Audit Log Retention</label>
                                <select 
                                    className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border" 
                                    value={settings.auditLogRetention}
                                    onChange={(e) => setSettings({ ...settings, auditLogRetention: e.target.value })}
                                >
                                    <option value="1 Year">1 Year</option>
                                    <option value="3 Years">3 Years</option>
                                    <option value="5 Years">5 Years</option>
                                    <option value="7 Years">7 Years (HIPAA & Medical Standard)</option>
                                    <option value="Indefinite">Indefinite (Permanent Storage)</option>
                                </select>
                                <p className="mt-2 text-[11px] text-on-surface-variant italic">Retention policy affects storage billing overhead and legal compliance standing.</p>
                            </div>
                        </section>
                    </div>
                );
            case 'Gateway Integrations':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Payment Gateways</h2>
                            <div className="space-y-4">
                                {/* Stripe Connect */}
                                <div className="flex items-center justify-between p-5 border border-outline-variant rounded-xl bg-surface-container-lowest hover:border-primary/40 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${settings.stripeActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            ST
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-primary">Stripe Connect</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${settings.stripeActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {settings.stripeActive ? 'ACTIVE' : 'DISABLED'}
                                                </span>
                                            </div>
                                            <p className="text-body-sm text-on-surface-variant mt-0.5">{settings.stripeStatus}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenGatewayModal('stripe')}
                                        className="px-4 py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">settings</span>
                                        Configure
                                    </button>
                                </div>

                                {/* eSewa Integration */}
                                <div className="flex items-center justify-between p-5 border border-outline-variant rounded-xl bg-surface-container-lowest hover:border-primary/40 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${settings.esewaActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                            eS
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-primary">eSewa Integration</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${settings.esewaActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                    {settings.esewaActive ? 'ACTIVE' : 'DISABLED'}
                                                </span>
                                            </div>
                                            <p className="text-body-sm text-on-surface-variant mt-0.5">{settings.esewaStatus}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleOpenGatewayModal('esewa')}
                                        className="px-4 py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">settings</span>
                                        Configure
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Messaging Providers</h2>
                            {/* Twilio SMS */}
                            <div className="flex items-center justify-between p-5 border border-outline-variant rounded-xl bg-surface-container-lowest hover:border-primary/40 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${settings.twilioActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                        Tw
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-primary">Twilio SMS Gateway</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${settings.twilioActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                                {settings.twilioActive ? 'ACTIVE' : 'DISABLED'}
                                            </span>
                                        </div>
                                        <p className="text-body-sm text-on-surface-variant mt-0.5">{settings.twilioStatus}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleOpenGatewayModal('twilio')}
                                    className="px-4 py-2 bg-surface-container text-primary font-label-md rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">settings</span>
                                    Configure
                                </button>
                            </div>
                        </section>
                    </div>
                );
            case 'Security Policies':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Authentication & Session Rules</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Session Timeout (Idle Duration)</label>
                                    <select 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border" 
                                        value={settings.sessionTimeoutMinutes}
                                        onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value) || 15 })}
                                    >
                                        <option value={5}>5 Minutes</option>
                                        <option value={15}>15 Minutes (HIPAA Default)</option>
                                        <option value={30}>30 Minutes</option>
                                        <option value={60}>1 Hour</option>
                                        <option value={120}>2 Hours</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-label-md text-label-md text-outline uppercase mb-2">Minimum Password Length</label>
                                    <select 
                                        className="w-full border-outline-variant rounded-lg px-4 py-3 text-body-md focus:ring-primary focus:border-primary bg-surface-container-lowest border" 
                                        value={settings.minPasswordLength}
                                        onChange={(e) => setSettings({ ...settings, minPasswordLength: parseInt(e.target.value) || 8 })}
                                    >
                                        <option value={6}>6 Characters (Basic)</option>
                                        <option value={8}>8 Characters (Recommended)</option>
                                        <option value={10}>10 Characters (High Security)</option>
                                        <option value={12}>12 Characters (Enterprise Grade)</option>
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center justify-between p-5 bg-surface-container-lowest border border-outline-variant rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-primary flex items-center gap-2">
                                            Enforce Global Multi-Factor Authentication (MFA)
                                            {settings.enforceGlobalMfa && (
                                                <span className="text-[10px] uppercase font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Mandatory</span>
                                            )}
                                        </h4>
                                        <p className="text-body-sm text-on-surface-variant mt-1">Require two-factor verification code on login for all Administrator and Superadmin accounts across all tenants.</p>
                                    </div>
                                    <button 
                                        onClick={() => setSettings({ ...settings, enforceGlobalMfa: !settings.enforceGlobalMfa })}
                                        type="button"
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${settings.enforceGlobalMfa ? 'bg-green-600' : 'bg-surface-container-highest'}`}
                                    >
                                        <span className={`${settings.enforceGlobalMfa ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">API Access Rules & Rate Limiting</h2>
                            <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-primary">Global Request Rate Limit</h4>
                                        <p className="text-body-sm text-on-surface-variant mt-0.5">Maximum permitted API calls per minute per IP address.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number" 
                                            className="w-32 border border-outline-variant rounded-lg px-4 py-2 font-mono-data text-right focus:ring-primary focus:border-primary"
                                            value={settings.rateLimitRequestsPerMin}
                                            onChange={(e) => setSettings({ ...settings, rateLimitRequestsPerMin: parseInt(e.target.value) || 1000 })}
                                            min={100}
                                            max={10000}
                                            step={100}
                                        />
                                        <span className="text-body-sm text-outline">req / min</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-amber-700 mt-0.5">shield</span>
                                    <div className="text-sm">
                                        <span className="font-bold">Active DDoS Mitigation: </span>
                                        Burst traffic exceeding {settings.rateLimitRequestsPerMin} req/min will trigger an automatic HTTP 429 Too Many Requests response.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'Billing & Subscriptions':
                const pendingExtensionsCount = extensionRequests.filter(r => r.status === 'PENDING').length;
                const expiringTenantsCount = tenantSubs.filter(t => t.subscriptionStatus === 'EXPIRING_SOON').length;

                return (
                    <div className="w-full space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* TOP STATS STRIP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-3 shadow-sm">
                                <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
                                    <span className="material-symbols-outlined text-[24px]">layers</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase">Catalog Plans</p>
                                    <h4 className="text-xl font-bold text-primary">{plansList.length} Active Tiers</h4>
                                </div>
                            </div>
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-3 shadow-sm">
                                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                    <span className="material-symbols-outlined text-[24px]">percent</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase">Appt Commission</p>
                                    <h4 className="text-xl font-bold text-emerald-700">{commissionRate}% Default</h4>
                                </div>
                            </div>
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-3 shadow-sm">
                                <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg">
                                    <span className="material-symbols-outlined text-[24px]">domain</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase">Tenant Subscriptions</p>
                                    <h4 className="text-xl font-bold text-on-surface">{tenantSubs.length} Organizations</h4>
                                </div>
                            </div>
                            <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center gap-3 shadow-sm">
                                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                                    <span className="material-symbols-outlined text-[24px]">timelapse</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase">Extension Queue</p>
                                    <h4 className="text-xl font-bold text-amber-800">{pendingExtensionsCount} Pending</h4>
                                </div>
                            </div>
                        </div>

                        {/* SUB-TABS NAVIGATION */}
                        <div className="flex border-b border-surface-container gap-2 overflow-x-auto pb-px">
                            <button
                                type="button"
                                onClick={() => setBillingSubTab('plans')}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    billingSubTab === 'plans'
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                                Plan Catalog & Pricing
                                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 font-mono">
                                    {plansList.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingSubTab('commission')}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    billingSubTab === 'commission'
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">percent</span>
                                Appointment Commission
                                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-mono">
                                    {commissionRate}%
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingSubTab('tenants')}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    billingSubTab === 'tenants'
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                                Tenant Subscriptions
                                {expiringTenantsCount > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 animate-pulse">
                                        {expiringTenantsCount} expiring
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingSubTab('extensions')}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    billingSubTab === 'extensions'
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">timer</span>
                                Emergency Extensions
                                {pendingExtensionsCount > 0 && (
                                    <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">
                                        {pendingExtensionsCount}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingSubTab('invoices')}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    billingSubTab === 'invoices'
                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                Subscription Invoices
                                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700 font-mono">
                                    {settings.invoices?.length || 0}
                                </span>
                            </button>
                        </div>

                        {/* ============================================================ */}
                        {/* SUB-VIEW 1: SUBSCRIPTION PLANS CATALOG */}
                        {/* ============================================================ */}
                        {billingSubTab === 'plans' && (
                            <div className="space-y-6 animate-in fade-in duration-150">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">Platform Subscription Tiers</h3>
                                        <p className="text-sm text-on-surface-variant">
                                            Dynamically configured plans in the database catalog. Price adjustments apply immediately to new checkouts and renewals while existing customer transaction amounts remain immutable.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenCreatePlanModal}
                                        className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                        Create Custom Plan
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {plansList.map(plan => (
                                        <div
                                            key={plan.id}
                                            className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                                                plan.isPopular
                                                    ? 'bg-gradient-to-b from-blue-50/50 to-surface-container-lowest border-primary shadow-md'
                                                    : 'bg-surface-container-lowest border-outline-variant hover:shadow-lg'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <div>
                                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border">
                                                            {plan.name}
                                                        </span>
                                                        <h4 className="text-xl font-bold text-primary mt-1">
                                                            {plan.displayName || plan.name}
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            plan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                            {plan.active ? 'ACTIVE' : 'INACTIVE'}
                                                        </span>
                                                        {plan.isPopular && (
                                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                                                Popular
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Pricing Block */}
                                                <div className="my-4 p-3 bg-surface-container-low rounded-xl">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-2xl font-black text-on-surface">
                                                            Rs. {plan.monthlyPrice?.toLocaleString()}
                                                        </span>
                                                        <span className="text-xs text-on-surface-variant font-medium">/month</span>
                                                    </div>
                                                    <div className="text-xs text-on-surface-variant mt-1">
                                                        Annual: <strong className="text-primary font-bold">Rs. {plan.annualPrice?.toLocaleString()}</strong>/year
                                                    </div>
                                                </div>

                                                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed line-clamp-2">
                                                    {plan.description}
                                                </p>

                                                {/* Quotas */}
                                                <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-medium">
                                                    <div className="p-2 bg-surface-container-lowest border rounded-lg">
                                                        <span className="text-on-surface-variant block text-[10px]">Staff Limit</span>
                                                        <span className="font-bold text-on-surface">
                                                            {plan.userLimit === -1 ? 'Unlimited' : `${plan.userLimit} Users`}
                                                        </span>
                                                    </div>
                                                    <div className="p-2 bg-surface-container-lowest border rounded-lg">
                                                        <span className="text-on-surface-variant block text-[10px]">Appt Limit</span>
                                                        <span className="font-bold text-on-surface">
                                                            {plan.appointmentLimit === -1 ? 'Unlimited' : `${plan.appointmentLimit}/mo`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Features Preview */}
                                                <div className="space-y-1.5 mb-6">
                                                    <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Features Included</p>
                                                    {plan.features && plan.features.slice(0, 4).map((f, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs text-on-surface">
                                                            <span className="material-symbols-outlined text-[15px] text-emerald-600">check_circle</span>
                                                            <span className="truncate">{f}</span>
                                                        </div>
                                                    ))}
                                                    {plan.features && plan.features.length > 4 && (
                                                        <p className="text-[11px] text-primary font-medium pl-6">
                                                            +{plan.features.length - 4} more features
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2 pt-3 border-t border-surface-container">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditPlanModal(plan)}
                                                    className="flex-1 py-2 px-3 border border-outline-variant hover:border-primary text-primary hover:bg-primary/5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[15px]">edit</span>
                                                    Edit Plan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => plan.id && handleTogglePlanStatus(plan.id)}
                                                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                                        plan.active
                                                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-[15px]">
                                                        {plan.active ? 'pause_circle' : 'play_circle'}
                                                    </span>
                                                    {plan.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* SUB-VIEW 2: APPOINTMENT COMMISSION RATE SETTING */}
                        {/* ============================================================ */}
                        {billingSubTab === 'commission' && (
                            <div className="max-w-2xl space-y-6 animate-in fade-in duration-150">
                                <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm space-y-5">
                                    <div className="flex items-center gap-3 pb-4 border-b border-surface-container">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[28px]">percent</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-on-surface">Platform Appointment Commission</h3>
                                            <p className="text-xs text-on-surface-variant">Configure platform-wide transaction commission percentage</p>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                                        <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                                            <span className="material-symbols-outlined text-[18px]">verified_user</span>
                                            Separate Stream & Historical Rate Preservation
                                        </div>
                                        <p className="leading-relaxed">
                                            Appointment commission revenue is calculated automatically for every paid/completed appointment and is kept strictly separate from Subscription MRR.
                                        </p>
                                        <p className="text-emerald-800 leading-relaxed">
                                            When this rate is updated, subsequent appointments use the new rate while previous appointment transaction records permanently preserve their historical commission rate and amounts.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                                            Platform Commission Rate (%)
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-1">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="50"
                                                    value={commissionRate}
                                                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                                                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-lg font-bold text-on-surface focus:outline-none focus:border-primary pr-12 font-mono"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                                                    %
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSaveCommissionRate}
                                                disabled={isSavingCommission}
                                                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                                            >
                                                {isSavingCommission ? (
                                                    <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                                )}
                                                Update Commission Rate
                                            </button>
                                        </div>
                                    </div>

                                    {/* Real-time simulation box */}
                                    <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60">
                                        <h5 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Transaction Calculation Preview (Rs. 1,000 Appointment)</h5>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="p-2.5 bg-white rounded-lg border">
                                                <p className="text-[10px] text-on-surface-variant uppercase">Gross Amount</p>
                                                <p className="font-mono font-bold text-on-surface text-sm mt-0.5">Rs. 1,000</p>
                                            </div>
                                            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <p className="text-[10px] text-emerald-800 uppercase font-bold">Platform Cut ({commissionRate}%)</p>
                                                <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">
                                                    Rs. {(1000 * (commissionRate / 100.0)).toFixed(1)}
                                                </p>
                                            </div>
                                            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-[10px] text-blue-800 uppercase font-bold">Provider Payout</p>
                                                <p className="font-mono font-black text-blue-700 text-sm mt-0.5">
                                                    Rs. {(1000 - (1000 * (commissionRate / 100.0))).toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* SUB-VIEW 3: TENANT SUBSCRIPTIONS DIRECTORY */}
                        {/* ============================================================ */}
                        {billingSubTab === 'tenants' && (
                            <div className="space-y-6 animate-in fade-in duration-150">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">Tenant Subscription Status Directory</h3>
                                        <p className="text-sm text-on-surface-variant">
                                            Monitor live subscription health, monthly run rates, and exercise administrative controls (Suspend, Reactivate, Manual Extend).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={fetchTenantSubs}
                                        className="px-3.5 py-2 border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-on-surface"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                        Refresh Subscriptions
                                    </button>
                                </div>

                                {/* Filters and Search Bar */}
                                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm space-y-3">
                                    {/* Top Controls Row */}
                                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                                        {/* Search Input */}
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                                search
                                            </span>
                                            <input
                                                type="text"
                                                value={tenantSearchQuery}
                                                onChange={(e) => setTenantSearchQuery(e.target.value)}
                                                placeholder="Search organization name, PAN, or admin email..."
                                                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary transition-all font-medium"
                                            />
                                            {tenantSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTenantSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Filter Dropdowns */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Vertical / Org Type Filter */}
                                            <select
                                                value={tenantOrgTypeFilter}
                                                onChange={(e) => setTenantOrgTypeFilter(e.target.value)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Verticals</option>
                                                <option value="Clinic">Healthcare / Clinic</option>
                                                <option value="College">College / Education</option>
                                                <option value="Saloon">Salon & Spa</option>
                                                <option value="Other">Other Organization</option>
                                            </select>

                                            {/* Plan Filter */}
                                            <select
                                                value={tenantPlanFilter}
                                                onChange={(e) => setTenantPlanFilter(e.target.value)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Plans</option>
                                                <option value="STARTER">Starter</option>
                                                <option value="PROFESSIONAL">Professional</option>
                                                <option value="ENTERPRISE">Enterprise</option>
                                            </select>

                                            {/* Billing Cycle Filter */}
                                            <select
                                                value={tenantCycleFilter}
                                                onChange={(e) => setTenantCycleFilter(e.target.value)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Cycles</option>
                                                <option value="MONTHLY">Monthly</option>
                                                <option value="ANNUAL">Annual</option>
                                            </select>

                                            {/* Sort By Dropdown */}
                                            <select
                                                value={tenantSortBy}
                                                onChange={(e) => setTenantSortBy(e.target.value as any)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="days_asc">Expiring Soonest</option>
                                                <option value="days_desc">Expiring Latest</option>
                                                <option value="mrr_desc">Highest MRR</option>
                                                <option value="name_asc">Organization Name (A-Z)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bottom Status Pills Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setTenantStatusFilter('ALL')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    tenantStatusFilter === 'ALL'
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                                                }`}
                                            >
                                                All ({tenantSubs.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTenantStatusFilter('ACTIVE')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    tenantStatusFilter === 'ACTIVE'
                                                        ? 'bg-emerald-700 text-white shadow-sm'
                                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                }`}
                                            >
                                                Active ({countActiveTenants})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTenantStatusFilter('EXPIRING_SOON')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    tenantStatusFilter === 'EXPIRING_SOON'
                                                        ? 'bg-amber-600 text-white shadow-sm'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                }`}
                                            >
                                                Expiring Soon ({countExpiringSoonTenants})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTenantStatusFilter('EXPIRED')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    tenantStatusFilter === 'EXPIRED'
                                                        ? 'bg-rose-700 text-white shadow-sm'
                                                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                                                }`}
                                            >
                                                Expired ({countExpiredTenants})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTenantStatusFilter('SUSPENDED')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    tenantStatusFilter === 'SUSPENDED'
                                                        ? 'bg-red-800 text-white shadow-sm'
                                                        : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                                                }`}
                                            >
                                                Suspended ({countSuspendedTenants})
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] text-on-surface-variant font-medium">
                                                Showing <strong>{filteredTenantSubs.length}</strong> of {tenantSubs.length} organizations
                                            </span>
                                            {(tenantSearchQuery || tenantStatusFilter !== 'ALL' || tenantPlanFilter !== 'ALL' || tenantCycleFilter !== 'ALL' || tenantOrgTypeFilter !== 'ALL') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTenantSearchQuery('');
                                                        setTenantStatusFilter('ALL');
                                                        setTenantPlanFilter('ALL');
                                                        setTenantCycleFilter('ALL');
                                                        setTenantOrgTypeFilter('ALL');
                                                    }}
                                                    className="text-[11px] text-primary font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">filter_alt_off</span>
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant rounded-2xl bg-surface-container-lowest shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-surface-container bg-surface-container-low/50">
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Organization & Vertical</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Active Plan</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">MRR Contribution</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Cycle Dates</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Remaining</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Status</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase text-right">Admin Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTenantSubs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-4xl text-outline/60">filter_alt_off</span>
                                                            <p className="font-bold text-sm text-on-surface">No organizations match the selected filters</p>
                                                            <p className="text-xs text-on-surface-variant">Try adjusting your search query, vertical, status, or plan filters.</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setTenantSearchQuery('');
                                                                    setTenantStatusFilter('ALL');
                                                                    setTenantPlanFilter('ALL');
                                                                    setTenantCycleFilter('ALL');
                                                                    setTenantOrgTypeFilter('ALL');
                                                                }}
                                                                className="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer"
                                                            >
                                                                Reset All Filters
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedTenantSubs.map(t => {
                                                    const tid = t.id ?? t.tenantId ?? 0;
                                                    const orgName = t.organizationName || t.name || 'Unnamed Organization';
                                                    const orgBadge = getOrgTypeBadge(t.organizationType);
                                                    const tier = t.planTier || t.subscriptionTier || 'Starter';
                                                    const cycle = t.billingCycle || 'Monthly';
                                                    const mrr = t.currentMrr ?? t.mrrContribution ?? 0;
                                                    const start = t.startDate || t.subscriptionStartDate || 'Seed Initial';
                                                    const expiry = t.expiryDate || t.subscriptionExpiryDate || 'Ongoing';
                                                    const days = t.daysRemaining !== undefined ? t.daysRemaining : t.remainingDays;
                                                    const status = t.subscriptionStatus || 'ACTIVE';

                                                    return (
                                                        <tr key={tid} className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                                                            <td className="py-4 px-4 font-medium text-on-surface">
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-bold text-primary">{orgName}</span>
                                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${orgBadge.className}`}>
                                                                            <span className="material-symbols-outlined text-[12px]">{orgBadge.icon}</span>
                                                                            {orgBadge.label}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs text-on-surface-variant font-mono">PAN: {t.registrationNumber || 'N/A'}</span>
                                                                    {t.emergencyExtensionDays && t.emergencyExtensionDays > 0 ? (
                                                                        <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit">
                                                                            +{t.emergencyExtensionDays}d Extended
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                                                    {tier} ({cycle})
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 font-mono font-bold text-on-surface">
                                                                Rs. {mrr.toLocaleString()}
                                                            </td>
                                                            <td className="py-4 px-4 text-xs text-on-surface-variant font-mono">
                                                                <div>Start: {start}</div>
                                                                <div>Expiry: <strong className="text-on-surface">{expiry}</strong></div>
                                                            </td>
                                                            <td className="py-4 px-4 font-mono-data text-xs font-bold">
                                                                {days !== undefined && days !== null ? (
                                                                    days < 0 ? (
                                                                        <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                                                            Expired ({Math.abs(days)}d ago)
                                                                        </span>
                                                                    ) : days <= 7 ? (
                                                                        <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                                                                            {days} days remaining
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                                                            {days} days remaining
                                                                        </span>
                                                                    )
                                                                ) : (
                                                                    <span className="text-outline italic">Calculating...</span>
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    status === 'ACTIVE'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : status === 'EXPIRING_SOON'
                                                                        ? 'bg-amber-100 text-amber-800'
                                                                        : status === 'SUSPENDED'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        status === 'ACTIVE'
                                                                            ? 'bg-emerald-500'
                                                                            : status === 'EXPIRING_SOON'
                                                                            ? 'bg-amber-500'
                                                                            : status === 'SUSPENDED'
                                                                            ? 'bg-red-500'
                                                                            : 'bg-rose-500'
                                                                    }`} />
                                                                    {status === 'ACTIVE'
                                                                        ? 'Active'
                                                                        : status === 'EXPIRING_SOON'
                                                                        ? 'Expiring Soon'
                                                                        : status === 'SUSPENDED'
                                                                        ? 'Suspended'
                                                                        : 'Expired'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setExtendModalTenant({ ...t, id: tid, tenantId: tid, name: orgName, organizationName: orgName, subscriptionTier: tier, planTier: tier, subscriptionExpiryDate: expiry, expiryDate: expiry });
                                                                            setExtendDays(14);
                                                                            setExtendReason('Emergency Administrative Grace Period');
                                                                        }}
                                                                        className="p-1.5 hover:bg-surface-container text-primary rounded-lg border border-outline-variant text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                                        title="Grant Emergency Extension"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">more_time</span>
                                                                        Extend
                                                                    </button>

                                                                    {status === 'SUSPENDED' ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleConfirmReactivateTenant(tid)}
                                                                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                                            title="Reactivate Subscription"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[16px]">play_circle</span>
                                                                            Reactivate
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSuspendModalTenant({ ...t, id: tid, tenantId: tid, name: orgName, organizationName: orgName, subscriptionTier: tier, planTier: tier, subscriptionExpiryDate: expiry, expiryDate: expiry });
                                                                                setSuspendReason('');
                                                                            }}
                                                                            className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                                            title="Suspend Subscription & Enforce Renewal Gate"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[16px]">block</span>
                                                                            Suspend
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Tenant Subscriptions Dynamic Pagination Bar */}
                                    <div className="p-4 border-t border-surface-container bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-on-surface-variant font-mono-data">
                                                Showing <span className="font-bold text-primary">{tenantTotalEntries > 0 ? tenantStartIndex + 1 : 0} - {tenantEndIndex}</span> of <span className="font-bold text-primary">{tenantTotalEntries}</span> organizations
                                                {tenantTotalEntries !== tenantSubs.length && (
                                                    <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                                        (filtered from {tenantSubs.length} total)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                                                <span>Rows:</span>
                                                <select
                                                    value={tenantPageSize}
                                                    onChange={(e) => setTenantPageSize(Number(e.target.value))}
                                                    className="bg-surface-container-lowest py-1 px-2 rounded border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary transition cursor-pointer"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                type="button"
                                                onClick={() => setTenantCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={tenantSafeCurrentPage <= 1}
                                                className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                aria-label="Previous Page"
                                            >
                                                <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {getTenantPageNumbers().map(page => (
                                                    <button 
                                                        key={page}
                                                        type="button"
                                                        onClick={() => setTenantCurrentPage(page)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                                                            tenantSafeCurrentPage === page
                                                                ? 'bg-primary text-on-primary shadow-sm shadow-primary/30'
                                                                : 'border border-outline-variant/40 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/40'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setTenantCurrentPage(p => Math.min(tenantTotalPages, p + 1))}
                                                disabled={tenantSafeCurrentPage >= tenantTotalPages || tenantTotalEntries === 0}
                                                className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                aria-label="Next Page"
                                            >
                                                Next
                                                <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* SUB-VIEW 4: EMERGENCY EXTENSION REQUESTS QUEUE */}
                        {/* ============================================================ */}
                        {billingSubTab === 'extensions' && (
                            <div className="space-y-6 animate-in fade-in duration-150">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">Emergency Subscription Extension Queue</h3>
                                        <p className="text-sm text-on-surface-variant">
                                            Review extension requests submitted by organization administrators needing emergency operating grace periods.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={fetchExtensionRequests}
                                        className="px-3.5 py-2 border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-on-surface"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                        Refresh Queue
                                    </button>
                                </div>

                                {/* Search and Filters Bar (Matching Tenant Subscriptions) */}
                                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl space-y-3 shadow-sm">
                                    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                                        {/* Search Input */}
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                                search
                                            </span>
                                            <input
                                                type="text"
                                                value={extSearchQuery}
                                                onChange={(e) => setExtSearchQuery(e.target.value)}
                                                placeholder="Search organization name, PAN, or requester..."
                                                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary transition-all font-medium"
                                            />
                                            {extSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setExtSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Filter Dropdowns */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* Vertical / Org Type Filter */}
                                            <select
                                                value={extOrgTypeFilter}
                                                onChange={(e) => setExtOrgTypeFilter(e.target.value)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Verticals</option>
                                                <option value="Clinic">Healthcare / Clinic</option>
                                                <option value="College">College / Education</option>
                                                <option value="Saloon">Salon & Spa</option>
                                                <option value="Other">Other Organization</option>
                                            </select>

                                            {/* Plan Filter */}
                                            <select
                                                value={extPlanFilter}
                                                onChange={(e) => setExtPlanFilter(e.target.value)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Plans</option>
                                                <option value="STARTER">Starter</option>
                                                <option value="PROFESSIONAL">Professional</option>
                                                <option value="ENTERPRISE">Enterprise</option>
                                            </select>

                                            {/* Sort By Dropdown */}
                                            <select
                                                value={extSortBy}
                                                onChange={(e) => setExtSortBy(e.target.value as any)}
                                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="created_desc">Newest Requests First</option>
                                                <option value="created_asc">Oldest Requests First</option>
                                                <option value="days_desc">Most Days Requested</option>
                                                <option value="days_asc">Least Days Requested</option>
                                                <option value="name_asc">Organization Name (A-Z)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bottom Status Pills Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setExtStatusFilter('ALL')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    extStatusFilter === 'ALL'
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                                                }`}
                                            >
                                                All ({extensionRequests.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExtStatusFilter('PENDING')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                                    extStatusFilter === 'PENDING'
                                                        ? 'bg-amber-600 text-white shadow-sm'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                                }`}
                                            >
                                                Pending ({countPendingExt})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExtStatusFilter('APPROVED')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    extStatusFilter === 'APPROVED'
                                                        ? 'bg-emerald-700 text-white shadow-sm'
                                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                }`}
                                            >
                                                Approved ({countApprovedExt})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setExtStatusFilter('REJECTED')}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                    extStatusFilter === 'REJECTED'
                                                        ? 'bg-rose-700 text-white shadow-sm'
                                                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                                                }`}
                                            >
                                                Rejected ({countRejectedExt})
                                            </button>
                                        </div>

                                        {/* Results Counter & Clear Filters */}
                                        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                                            <span>
                                                Showing <strong>{filteredExtensionRequests.length}</strong> of {extensionRequests.length} requests
                                            </span>
                                            {(extSearchQuery || extStatusFilter !== 'ALL' || extPlanFilter !== 'ALL' || extOrgTypeFilter !== 'ALL') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setExtSearchQuery('');
                                                        setExtStatusFilter('ALL');
                                                        setExtPlanFilter('ALL');
                                                        setExtOrgTypeFilter('ALL');
                                                        setExtSortBy('created_desc');
                                                    }}
                                                    className="text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                                    Clear Filters
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto border border-outline-variant rounded-2xl bg-surface-container-lowest shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-surface-container bg-surface-container-low/50">
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Organization & Vertical</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Current Plan & Expiry</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Requested Days</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Mandatory Justification</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Requested By</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase">Status</th>
                                                <th className="py-3 px-4 text-xs font-bold text-outline uppercase text-right">Review Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredExtensionRequests.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                                                        <div className="flex flex-col items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined text-outline text-[32px]">manage_search</span>
                                                            <p className="text-sm font-semibold">No emergency extension requests match your filters.</p>
                                                            {(extSearchQuery || extStatusFilter !== 'ALL' || extPlanFilter !== 'ALL' || extOrgTypeFilter !== 'ALL') && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setExtSearchQuery('');
                                                                        setExtStatusFilter('ALL');
                                                                        setExtPlanFilter('ALL');
                                                                        setExtOrgTypeFilter('ALL');
                                                                    }}
                                                                    className="text-xs text-primary underline font-bold mt-1 cursor-pointer"
                                                                >
                                                                    Reset all filters
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedExtensionRequests.map(req => {
                                                    const orgBadge = getOrgTypeBadge(req.organizationType);
                                                    const orgName = req.organizationName || req.tenantName || 'N/A';
                                                    const planName = req.currentPlan || req.currentPlanTier || 'Starter';
                                                    const requester = req.requestedByName || req.requestedBy || req.requestedByEmail || 'Admin';
                                                    const reviewer = req.processedByName || req.reviewedBy || 'Admin';

                                                    return (
                                                        <tr key={req.id} className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-start gap-2.5">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 mt-0.5 ${orgBadge.className}`}>
                                                                        <span className="material-symbols-outlined text-[13px]">{orgBadge.icon}</span>
                                                                        {orgBadge.label}
                                                                    </span>
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="font-bold text-primary truncate">
                                                                            {orgName}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono mt-0.5">
                                                                            <span>PAN: {req.registrationNumber || 'N/A'}</span>
                                                                            <span>• ID: #{req.tenantId}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-xs text-primary">{planName}</span>
                                                                    <span className="text-[11px] text-outline font-mono">
                                                                        {req.currentExpiryDate ? new Date(req.currentExpiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Ongoing'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 font-mono-data font-bold text-xs text-amber-700">
                                                                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                                                                    +{req.requestedDays} Days
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <p className="text-xs text-on-surface max-w-xs font-medium line-clamp-2" title={req.reason}>
                                                                    "{req.reason}"
                                                                </p>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-primary">{requester}</span>
                                                                    <span className="text-[10px] text-outline font-mono">
                                                                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    req.status === 'APPROVED'
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : req.status === 'REJECTED'
                                                                        ? 'bg-rose-100 text-rose-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        req.status === 'APPROVED'
                                                                            ? 'bg-emerald-500'
                                                                            : req.status === 'REJECTED'
                                                                            ? 'bg-rose-500'
                                                                            : 'bg-amber-500'
                                                                    }`} />
                                                                    {req.status === 'APPROVED' ? 'Approved' : req.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-right">
                                                                {req.status === 'PENDING' ? (
                                                                    <div className="flex items-center justify-end gap-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setReviewModalRequest(req);
                                                                                setReviewApproved(true);
                                                                                setReviewApprovedDays(req.requestedDays || 14);
                                                                                setReviewNotes('');
                                                                            }}
                                                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[15px]">check</span>
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setReviewModalRequest(req);
                                                                                setReviewApproved(false);
                                                                                setReviewNotes('');
                                                                            }}
                                                                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[15px]">close</span>
                                                                            Reject
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-right">
                                                                        <span className="text-xs text-on-surface-variant font-medium block">
                                                                            Reviewed by <strong className="text-on-surface">{reviewer}</strong>
                                                                        </span>
                                                                        {req.processedAt && (
                                                                            <span className="text-[10px] text-outline font-mono block">
                                                                                {new Date(req.processedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Emergency Extensions Dynamic Pagination Bar */}
                                    <div className="p-4 border-t border-surface-container bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-on-surface-variant font-mono-data">
                                                Showing <span className="font-bold text-primary">{extTotalEntries > 0 ? extStartIndex + 1 : 0} - {extEndIndex}</span> of <span className="font-bold text-primary">{extTotalEntries}</span> requests
                                                {extTotalEntries !== extensionRequests.length && (
                                                    <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                                        (filtered from {extensionRequests.length} total)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                                                <span>Rows:</span>
                                                <select
                                                    value={extPageSize}
                                                    onChange={(e) => setExtPageSize(Number(e.target.value))}
                                                    className="bg-surface-container-lowest py-1 px-2 rounded border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary transition cursor-pointer"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                type="button"
                                                onClick={() => setExtCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={extSafeCurrentPage <= 1}
                                                className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                aria-label="Previous Page"
                                            >
                                                <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {getExtPageNumbers().map(page => (
                                                    <button 
                                                        key={page}
                                                        type="button"
                                                        onClick={() => setExtCurrentPage(page)}
                                                        className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                                                            extSafeCurrentPage === page
                                                                ? 'bg-primary text-on-primary shadow-sm shadow-primary/30'
                                                                : 'border border-outline-variant/40 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/40'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setExtCurrentPage(p => Math.min(extTotalPages, p + 1))}
                                                disabled={extSafeCurrentPage >= extTotalPages || extTotalEntries === 0}
                                                className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                aria-label="Next Page"
                                            >
                                                Next
                                                <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* SUB-VIEW 5: SUBSCRIPTION INVOICES & ORDERS HISTORY */}
                        {/* ============================================================ */}
                        {billingSubTab === 'invoices' && (
                            <div className="space-y-6 animate-in fade-in duration-150">
                                {/* Invoices Table */}
                                <section>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-surface-container pb-4 mb-4 gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">Subscription Financial Invoices & Verification</h3>
                                            <p className="text-sm text-on-surface-variant">Click any row to generate official PDF receipt or manage verification status.</p>
                                        </div>
                                    </div>

                                    {/* Search & Status Filters for Invoices */}
                                    <div className="mb-4 p-3 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                                search
                                            </span>
                                            <input
                                                type="text"
                                                value={invoiceSearchQuery}
                                                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                                                placeholder="Search by invoice #, organization, email, plan..."
                                                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:bg-white focus:outline-none focus:border-primary transition-all font-medium"
                                            />
                                            {invoiceSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={() => setInvoiceSearchQuery('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <select
                                                value={invoiceStatusFilter}
                                                onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                                            >
                                                <option value="ALL">All Statuses</option>
                                                <option value="PAID">Paid</option>
                                                <option value="REFUNDED">Refunded</option>
                                                <option value="PENDING">Pending</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-surface-container bg-surface-container-low/50">
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Invoice #</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Organization</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Plan</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Date</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Amount</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Gateway</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase">Status</th>
                                                    <th className="py-3 px-4 text-label-md font-label-md text-outline uppercase text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredInvoices.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="py-8 text-center text-on-surface-variant">No invoices recorded matching filters.</td>
                                                    </tr>
                                                ) : (
                                                    paginatedInvoices.map((inv) => (
                                                        <tr key={inv.id} className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                                                            <td className="py-4 px-4 font-mono-data font-medium text-primary">{inv.invoiceNumber}</td>
                                                            <td className="py-4 px-4 font-medium text-on-surface">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{inv.organizationName || 'Platform Headquarters'}</span>
                                                                    {inv.adminEmail && (
                                                                        <span className="text-xs text-on-surface-variant font-mono">{inv.adminEmail}</span>
                                                                    )}
                                                                    {emailSuccessSentIds.includes(inv.id) && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 w-fit">
                                                                            <span className="material-symbols-outlined text-[12px]">mark_email_read</span>
                                                                            Update Email Sent
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-body-md text-on-surface-variant">
                                                                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                                    {inv.planName || 'Enterprise License'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-body-md text-on-surface-variant">{inv.invoiceDate}</td>
                                                            <td className="py-4 px-4 font-bold text-primary">
                                                                {inv.currency === 'NPR' ? `Rs. ${inv.amount.toLocaleString()}` : `$${inv.amount.toLocaleString()}`}
                                                            </td>
                                                            <td className="py-4 px-4 text-body-sm text-on-surface-variant font-medium">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[15px] text-secondary">payments</span>
                                                                    {inv.paymentMethod || 'Direct'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4">
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    <span className={`px-2 py-0.5 rounded text-label-sm font-label-sm font-bold uppercase ${
                                                                        inv.status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' :
                                                                        inv.status.toLowerCase() === 'refunded' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                                                        'bg-amber-100 text-amber-800'
                                                                    }`}>
                                                                        {inv.status}
                                                                    </span>
                                                                    {inv.refundId && (
                                                                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-200">
                                                                            Ref: {inv.refundId}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-4 text-right relative">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdownId(openDropdownId === inv.id ? null : inv.id);
                                                                    }}
                                                                    className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                                                                >
                                                                    <span className="material-symbols-outlined">more_vert</span>
                                                                </button>

                                                                {openDropdownId === inv.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                                                        <div className="absolute right-4 top-12 w-52 bg-surface-container-lowest border border-surface-container rounded-xl shadow-xl z-50 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100">
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    setDetailModalInvoice(inv);
                                                                                }}
                                                                                className="w-full px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                                                                                <span>View Detail</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    handleDownloadInvoicePdf(inv);
                                                                                }}
                                                                                className="w-full px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
                                                                                <span>Download PDF</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    handleSendVerificationUpdate(inv);
                                                                                }}
                                                                                disabled={sendingUpdateInvoiceId === inv.id}
                                                                                className="w-full px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-emerald-600">outgoing_mail</span>
                                                                                <span>{sendingUpdateInvoiceId === inv.id ? 'Sending...' : 'Send Update Email'}</span>
                                                                            </button>
                                                                            {inv.status.toLowerCase() !== 'refunded' && (
                                                                                <button 
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setOpenDropdownId(null);
                                                                                        handleOpenRejectModal(inv);
                                                                                    }}
                                                                                    className="w-full px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[18px] text-rose-600">assignment_return</span>
                                                                                    <span>Reject & Refund</span>
                                                                                </button>
                                                                            )}
                                                                            <div className="h-px bg-surface-container my-1" />
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    setDeleteConfirmInvoice(inv);
                                                                                }}
                                                                                className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-red-500">delete</span>
                                                                                <span>Delete</span>
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Subscription Financial Invoices Dynamic Pagination Bar */}
                                        <div className="p-4 border-t border-surface-container bg-surface-container-low flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-xs text-on-surface-variant font-mono-data">
                                                    Showing <span className="font-bold text-primary">{invoiceTotalEntries > 0 ? invoiceStartIndex + 1 : 0} - {invoiceEndIndex}</span> of <span className="font-bold text-primary">{invoiceTotalEntries}</span> invoices
                                                    {invoiceTotalEntries !== (settings.invoices || []).length && (
                                                        <span className="text-[11px] text-on-surface-variant/70 ml-1 font-sans">
                                                            (filtered from {(settings.invoices || []).length} total)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
                                                    <span>Rows:</span>
                                                    <select
                                                        value={invoicePageSize}
                                                        onChange={(e) => setInvoicePageSize(Number(e.target.value))}
                                                        className="bg-surface-container-lowest py-1 px-2 rounded border border-outline-variant text-xs text-on-surface font-medium focus:outline-none focus:border-primary transition cursor-pointer"
                                                    >
                                                        <option value={5}>5</option>
                                                        <option value={10}>10</option>
                                                        <option value={20}>20</option>
                                                        <option value={50}>50</option>
                                                        <option value={100}>100</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    type="button"
                                                    onClick={() => setInvoiceCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={invoiceSafeCurrentPage <= 1}
                                                    className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                    aria-label="Previous Page"
                                                >
                                                    <span className="material-symbols-outlined text-sm leading-none">chevron_left</span>
                                                    Previous
                                                </button>
                                                <div className="flex items-center gap-1">
                                                    {getInvoicePageNumbers().map(page => (
                                                        <button 
                                                            key={page}
                                                            type="button"
                                                            onClick={() => setInvoiceCurrentPage(page)}
                                                            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                                                                invoiceSafeCurrentPage === page
                                                                    ? 'bg-primary text-on-primary shadow-sm shadow-primary/30'
                                                                    : 'border border-outline-variant/40 hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/40'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setInvoiceCurrentPage(p => Math.min(invoiceTotalPages, p + 1))}
                                                    disabled={invoiceSafeCurrentPage >= invoiceTotalPages || invoiceTotalEntries === 0}
                                                    className="px-3 py-1.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container-lowest rounded transition-colors border border-outline-variant/40 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed hover:text-primary cursor-pointer shadow-sm"
                                                    aria-label="Next Page"
                                                >
                                                    Next
                                                    <span className="material-symbols-outlined text-sm leading-none">chevron_right</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="superadmin-theme">
            <div className="bg-background text-on-surface font-sans min-h-screen relative overflow-x-hidden">
                <Sidebar />
                <TopNavigation />

                {/* In-App Toast Notification */}
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

                <main className="ml-sidebar-width pt-20 px-4 sm:px-6 lg:px-8 pb-16 min-w-0">
                    <div className="max-w-container-max mx-auto min-w-0">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 mt-4 gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-headline-lg font-headline-lg font-bold text-primary">Platform Configurations</h1>
                                <p className="text-body-md sm:text-body-lg text-on-surface-variant mt-1">Manage global environment variables, external integrations, and onboarding policies.</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={fetchSettings}
                                    disabled={isLoading || isSaving}
                                    className="p-3 border border-outline-variant bg-white rounded-lg hover:bg-surface-container transition-all text-on-surface-variant flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    title="Reload Settings"
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                                </button>
                                <button 
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">save</span>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Metric Bento Grid - 100% Dynamic & Reactive */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Card 1: Integrations */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <span className="material-symbols-outlined text-blue-600">power</span>
                                    </div>
                                    <span className={`font-mono-data text-[11px] px-2 py-0.5 rounded font-bold ${activeIntegrationsCount > 0 ? 'text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-100'}`}>
                                        {activeIntegrationsCount === 3 ? 'CONNECTED (3/3)' : `${activeIntegrationsCount} OF 3 ACTIVE`}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black text-primary">{activeIntegrationsCount} Active</h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">External Integrations</p>
                                </div>
                            </div>
                            
                            {/* Card 2: Currency & Timezone */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600">public</span>
                                    </div>
                                    <span className="text-purple-700 font-mono-data text-[11px] bg-purple-50 px-2 py-0.5 rounded font-bold">
                                        {settings.systemCurrency}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-2xl font-black text-primary truncate" title={`${settings.systemCurrency} / ${settings.baseTimezone}`}>
                                        {settings.systemCurrency} / {baseTimezoneCity}
                                    </h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">Base Currency & Timezone</p>
                                </div>
                            </div>
                            
                            {/* Card 3: Onboarding Mode */}
                            <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-orange-50 rounded-lg">
                                        <span className="material-symbols-outlined text-orange-600">admin_panel_settings</span>
                                    </div>
                                    <span className={`font-mono-data text-[11px] px-2 py-0.5 rounded font-bold ${settings.isWhiteGloveEnabled ? 'text-orange-700 bg-orange-50' : 'text-green-700 bg-green-50'}`}>
                                        {settings.isWhiteGloveEnabled ? 'VETTED' : 'OPEN'}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black text-primary">
                                        {settings.isWhiteGloveEnabled ? 'Strict' : 'Self-Serve'}
                                    </h3>
                                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">B2B Onboarding Mode</p>
                                </div>
                            </div>
                            
                            {/* Card 4: Production Release */}
                            <div className="bg-primary p-6 rounded-xl flex flex-col justify-between text-white shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                        <span className="material-symbols-outlined text-secondary-container">terminal</span>
                                    </div>
                                    <span className="text-secondary-container font-mono-data text-[11px] font-bold">
                                        {settings.enforceGlobalMfa ? 'MFA SECURED' : 'STANDARD'}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-3xl font-black">v2.4.0</h3>
                                    <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mt-1">Production Release</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Console with Sleek Top Tabs */}
                        <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                            {/* Top Tab Bar */}
                            <div className="border-b border-surface-container bg-surface-container-lowest px-4 sm:px-6 pt-3 flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
                                <nav className="flex space-x-1 sm:space-x-2">
                                    {(['General Preferences', 'Gateway Integrations', 'Security Policies', 'Billing & Subscriptions'] as SettingTabName[]).map((tabName) => {
                                        const isCurrent = activeTab === tabName;
                                        const pendingExtCount = extensionRequests.filter(r => r.status === 'PENDING').length;
                                        return (
                                            <button 
                                                key={tabName}
                                                onClick={() => setActiveTab(tabName)}
                                                className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                                    isCurrent 
                                                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg' 
                                                        : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${isCurrent ? 'text-primary' : 'text-outline'}`}>
                                                    {tabName === 'General Preferences' ? 'tune' : tabName === 'Gateway Integrations' ? 'api' : tabName === 'Security Policies' ? 'policy' : 'payments'}
                                                </span>
                                                <span>{tabName}</span>
                                                {tabName === 'Billing & Subscriptions' && pendingExtCount > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white animate-pulse">
                                                        {pendingExtCount}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Inner Content Area */}
                            <div className="p-4 sm:p-6 lg:p-8 bg-white min-w-0">
                                {isLoading ? (
                                    <div className="py-20 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                                        <span className="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
                                        <p className="font-medium">Loading platform configurations...</p>
                                    </div>
                                ) : (
                                    renderTabContent()
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Gateway Configuration Modal */}
                {activeGatewayModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant space-y-6">
                            <div className="flex justify-between items-center border-b border-surface-container pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center font-bold text-primary">
                                        {activeGatewayModal === 'stripe' ? 'ST' : activeGatewayModal === 'esewa' ? 'eS' : 'Tw'}
                                    </div>
                                    <div>
                                        <h3 className="font-headline-sm font-bold text-primary capitalize">
                                            {activeGatewayModal === 'stripe' ? 'Stripe Connect' : activeGatewayModal === 'esewa' ? 'eSewa Payment' : 'Twilio SMS'} Configuration
                                        </h3>
                                        <p className="text-body-sm text-on-surface-variant">Update API credentials and operating environment</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setActiveGatewayModal(null)}
                                    className="p-2 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Enable Switch */}
                                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-primary">Gateway Status</h4>
                                        <p className="text-body-sm text-on-surface-variant">Enable or disable transactions through this provider</p>
                                    </div>
                                    <button 
                                        onClick={() => setGatewayForm({ ...gatewayForm, active: !gatewayForm.active })}
                                        type="button"
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${gatewayForm.active ? 'bg-green-600' : 'bg-surface-container-highest'}`}
                                    >
                                        <span className={`${gatewayForm.active ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                    </button>
                                </div>

                                {/* Stripe Form Fields */}
                                {activeGatewayModal === 'stripe' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Publishable Key</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.publishableKey || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, publishableKey: e.target.value })}
                                                placeholder="pk_test_..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Secret Key</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.secretKey || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, secretKey: e.target.value })}
                                                placeholder="sk_test_..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Webhook Signing Secret</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.webhookSecret || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, webhookSecret: e.target.value })}
                                                placeholder="whsec_..."
                                            />
                                        </div>
                                    </>
                                )}

                                {/* eSewa Form Fields */}
                                {activeGatewayModal === 'esewa' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Merchant Code</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.merchantCode || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, merchantCode: e.target.value })}
                                                placeholder="EPAYTEST"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Secret Key</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.secretKey || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, secretKey: e.target.value })}
                                                placeholder="eSewa HMAC Key"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Operating Environment</label>
                                            <select 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.environment || 'TEST'}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, environment: e.target.value })}
                                            >
                                                <option value="TEST">UAT / Test Sandbox (rc-epay.esewa.com.np)</option>
                                                <option value="LIVE">Production Live (epay.esewa.com.np)</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {/* Twilio Form Fields */}
                                {activeGatewayModal === 'twilio' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Account SID</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.accountSid || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, accountSid: e.target.value })}
                                                placeholder="AC..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Auth Token</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.authToken || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, authToken: e.target.value })}
                                                placeholder="Auth Token"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-outline uppercase mb-1.5">Sender Number / Alphanumeric ID</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-outline-variant rounded-lg px-4 py-2.5 font-mono-data text-body-sm focus:ring-primary focus:border-primary"
                                                value={gatewayForm.senderNumber || ''}
                                                onChange={(e) => setGatewayForm({ ...gatewayForm, senderNumber: e.target.value })}
                                                placeholder="+15005550006"
                                            />
                                        </div>
                                    </>
                                )}

                                {gatewayTestStatus && (
                                    <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        {gatewayTestStatus}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center border-t border-surface-container pt-4">
                                <button 
                                    onClick={() => setGatewayTestStatus('Gateway connection verified: 200 OK')}
                                    className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-label-md hover:bg-surface-container transition-colors cursor-pointer"
                                >
                                    Test Handshake
                                </button>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setActiveGatewayModal(null)}
                                        className="px-4 py-2 rounded-lg text-outline font-label-md hover:bg-surface-container transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveGateway}
                                        className="px-6 py-2 bg-primary text-white rounded-lg font-label-md hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
                                    >
                                        Apply Config
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Billing Modal */}
                {isBillingModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant space-y-6">
                            <div className="flex justify-between items-center border-b border-surface-container pb-4">
                                <div>
                                    <h3 className="font-headline-sm font-bold text-primary">Manage Billing Profile</h3>
                                    <p className="text-body-sm text-on-surface-variant">Update invoice email and platform plan tier</p>
                                </div>
                                <button 
                                    onClick={() => setIsBillingModalOpen(false)}
                                    className="p-2 hover:bg-surface-container rounded-lg text-outline hover:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-outline uppercase mb-1.5">Billing Contact Email</label>
                                    <input 
                                        type="email" 
                                        className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary"
                                        value={billingForm.email}
                                        onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-outline uppercase mb-1.5">Platform License Tier</label>
                                    <select 
                                        className="w-full border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary"
                                        value={billingForm.tier}
                                        onChange={(e) => {
                                            const tier = e.target.value;
                                            const fee = tier === 'Ultimate Multi-Tenant' ? 7999 : tier === 'Professional License' ? 2999 : 4999;
                                            setBillingForm({ ...billingForm, tier, fee });
                                        }}
                                    >
                                        <option value="Enterprise License">Enterprise License ($4,999/yr)</option>
                                        <option value="Professional License">Professional License ($2,999/yr)</option>
                                        <option value="Ultimate Multi-Tenant">Ultimate Multi-Tenant ($7,999/yr)</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-surface-container-low rounded-xl">
                                    <div className="text-sm font-medium text-outline">Selected Annual Overhead</div>
                                    <div className="text-2xl font-black text-primary mt-1">${billingForm.fee.toLocaleString()}.00 / year</div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-surface-container pt-4">
                                <button 
                                    onClick={() => setIsBillingModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-outline font-label-md hover:bg-surface-container transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveBilling}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-label-md hover:bg-zinc-800 transition-colors cursor-pointer font-bold"
                                >
                                    Save Billing Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW DETAIL MODAL */}
                {detailModalInvoice && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-outline-variant overflow-hidden animate-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-slate-900 to-primary px-6 py-5 text-white flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-400/30">
                                            {detailModalInvoice.status || 'PAID'}
                                        </span>
                                        <span className="text-white/80 text-xs font-mono-data">
                                            {detailModalInvoice.invoiceNumber}
                                        </span>
                                        {detailModalInvoice.orderNumber && (
                                            <span className="text-white/60 text-xs font-mono-data">
                                                • {detailModalInvoice.orderNumber}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Subscription Invoice & Order Details</h3>
                                </div>
                                <button 
                                    onClick={() => setDetailModalInvoice(null)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
                                {/* Organization Section */}
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-primary">domain</span>
                                        Organization Profile
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-xs text-outline block">Organization Name</span>
                                            <span className="font-bold text-primary">{detailModalInvoice.organizationName || 'Platform Headquarters'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Organization Type</span>
                                            <span className="font-medium text-on-surface">{detailModalInvoice.organizationType || 'Healthcare Clinic'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Business PAN / Reg No</span>
                                            <span className="font-mono-data font-semibold text-on-surface">{detailModalInvoice.registrationNumber || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Physical Address / Location</span>
                                            <span className="font-medium text-on-surface">{detailModalInvoice.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Administrator Section */}
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                                        Administrator Contact
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-xs text-outline block">Administrator Name</span>
                                            <span className="font-bold text-on-surface">{detailModalInvoice.adminFullName || 'Administrator'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Email Address (For Invite)</span>
                                            <span className="font-medium text-secondary">{detailModalInvoice.adminEmail || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Phone Number</span>
                                            <span className="font-medium text-on-surface">{detailModalInvoice.adminPhone || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Account Password</span>
                                            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                                                Set via Email Invite Link
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription & Payment Section */}
                                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                        <span className="material-symbols-outlined text-[18px] text-primary">credit_card</span>
                                        Subscription & Payment Details
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-xs text-outline block">Plan Tier</span>
                                            <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                                                {detailModalInvoice.planName || 'Enterprise License'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Billing Cycle & Period</span>
                                            <span className="font-medium text-on-surface">{detailModalInvoice.billingPeriod || 'Annual'}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Payment Gateway</span>
                                            <span className="font-medium text-on-surface flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px] text-secondary">payments</span>
                                                {detailModalInvoice.paymentMethod || 'Direct Settlement'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Original Transaction ID</span>
                                            <span className="font-mono text-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60 inline-block mt-0.5 select-all">
                                                {detailModalInvoice.transactionId || detailModalInvoice.orderNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-outline block">Total Amount Paid</span>
                                            <span className="font-extrabold text-lg text-emerald-700">
                                                {detailModalInvoice.currency === 'NPR' ? `Rs. ${detailModalInvoice.amount.toLocaleString()}` : `$${detailModalInvoice.amount.toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Refund & Rejection Details (if rejected/refunded) */}
                                {(detailModalInvoice.status === 'Refunded' || detailModalInvoice.refundId) && (
                                    <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200">
                                        <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                                            <span className="material-symbols-outlined text-[18px] text-purple-700">assignment_return</span>
                                            Gateway Refund & Rejection Record
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-xs text-purple-700 block">Gateway Refund Reference ID</span>
                                                <span className="font-mono-data font-bold text-purple-900">{detailModalInvoice.refundId || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-purple-700 block">Original Transaction Reference</span>
                                                <span className="font-mono-data font-semibold text-slate-800">{detailModalInvoice.transactionId || detailModalInvoice.orderNumber || 'N/A'}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="text-xs text-purple-700 block">Administrative Rejection Reason</span>
                                                <span className="font-medium text-purple-950 bg-white/80 p-2.5 rounded-lg border border-purple-200/80 block mt-1">
                                                    {detailModalInvoice.refundReason || 'Subscription request rejected after administrative verification review'}
                                                </span>
                                            </div>
                                            {detailModalInvoice.refundedAt && (
                                                <div className="sm:col-span-2">
                                                    <span className="text-xs text-purple-700 block">Refund Processed At</span>
                                                    <span className="text-xs font-semibold text-slate-700">{detailModalInvoice.refundedAt}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-between items-center bg-slate-50 border-t border-surface-container px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleDownloadInvoicePdf(detailModalInvoice)}
                                        className="px-4 py-2.5 bg-primary text-white rounded-xl font-label-md hover:bg-primary/90 transition-all cursor-pointer font-bold flex items-center gap-2 shadow-sm text-xs sm:text-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">download</span>
                                        <span>Download PDF</span>
                                    </button>
                                    {detailModalInvoice.status !== 'Refunded' && (
                                        <button 
                                            onClick={() => {
                                                const target = detailModalInvoice;
                                                setDetailModalInvoice(null);
                                                handleOpenRejectModal(target);
                                            }}
                                            className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl font-label-md transition-all cursor-pointer font-bold flex items-center gap-1.5 text-xs sm:text-sm"
                                        >
                                            <span className="material-symbols-outlined text-[18px] text-rose-600">cancel</span>
                                            <span>Reject & Refund</span>
                                        </button>
                                    )}
                                </div>
                                <button 
                                    onClick={() => setDetailModalInvoice(null)}
                                    className="px-5 py-2.5 border border-outline-variant bg-white rounded-xl text-on-surface font-label-md hover:bg-surface-container transition-colors cursor-pointer font-medium text-xs sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* REJECT & GATEWAY REFUND MODAL */}
                {rejectModalInvoice && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in zoom-in-95 duration-150 text-left">
                            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[24px]">assignment_return</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-on-surface">Reject Subscription & Refund</h3>
                                        <p className="text-xs text-on-surface-variant font-mono">Order #{rejectModalInvoice.orderNumber || rejectModalInvoice.invoiceNumber}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRejectModalInvoice(null)}
                                    disabled={isProcessingRefund}
                                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            {/* Warning / Explanation Callout */}
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 space-y-1.5">
                                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                                    <span className="material-symbols-outlined text-[17px]">warning</span>
                                    Automatic Payment Gateway Refund
                                </div>
                                <p className="leading-relaxed">
                                    Rejecting will immediately initiate an automated refund of <strong className="text-rose-950 font-bold">{rejectModalInvoice.currency === 'NPR' ? `Rs. ${rejectModalInvoice.amount.toLocaleString()}` : `$${rejectModalInvoice.amount.toLocaleString()}`}</strong> via <strong className="text-rose-950 font-bold">{rejectModalInvoice.paymentMethod || 'eSewa'}</strong> using original reference <span className="font-mono bg-white/70 px-1 py-0.5 rounded border border-rose-200">{rejectModalInvoice.transactionId || rejectModalInvoice.orderNumber}</span>.
                                </p>
                                <p className="text-rose-700 leading-relaxed">
                                    The applicant at <span className="font-bold text-rose-900 underline decoration-rose-300">{rejectModalInvoice.adminEmail}</span> (Email Address For Invite) will receive an official notification email including your rejection explanation and full refund settlement details.
                                </p>
                            </div>

                            {/* Reason Category Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Rejection Reason Category *</label>
                                <select
                                    value={rejectReasonCategory}
                                    onChange={(e) => setRejectReasonCategory(e.target.value)}
                                    disabled={isProcessingRefund}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-medium"
                                >
                                    <option value="Invalid or Incomplete Organization Credentials">Invalid or Incomplete Organization Credentials</option>
                                    <option value="PAN/Registration Verification Mismatch">PAN/Registration Verification Mismatch</option>
                                    <option value="Unauthorized Entity Representative">Unauthorized Entity Representative</option>
                                    <option value="Duplicate Organization Registration">Duplicate Organization Registration</option>
                                    <option value="Compliance and Legal Policy Restriction">Compliance and Legal Policy Restriction</option>
                                    <option value="Other (Specify Custom Reason Below)">Other (Specify Custom Reason Below)</option>
                                </select>
                            </div>

                            {/* Additional Notes */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">
                                    Additional Explanation / Instructions for Admin
                                </label>
                                <textarea
                                    value={rejectCustomReason}
                                    onChange={(e) => setRejectCustomReason(e.target.value)}
                                    placeholder="Provide detailed reasons or instructions for the administrator regarding why the subscription request was rejected..."
                                    rows={3}
                                    disabled={isProcessingRefund}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            {/* Modal Action Buttons */}
                            <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalInvoice(null)}
                                    disabled={isProcessingRefund}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-sm font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmRejectAndRefund}
                                    disabled={isProcessingRefund}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isProcessingRefund ? (
                                        <>
                                            <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                                            <span>Processing Refund...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                                            <span>Confirm & Process Refund</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DELETE CONFIRMATION ALERT BOX */}
                {deleteConfirmInvoice && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                                <span className="material-symbols-outlined text-[32px]">delete_forever</span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Delete Subscription Invoice?</h3>
                                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    Are you sure you want to delete invoice <strong className="text-slate-900 font-mono-data">{deleteConfirmInvoice.invoiceNumber}</strong>
                                    {deleteConfirmInvoice.organizationName ? <span> for <strong>{deleteConfirmInvoice.organizationName}</strong></span> : ''}? 
                                    This action will permanently remove this record from the subscription invoice ledger.
                                </p>
                            </div>

                            <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 text-left flex items-start gap-2">
                                <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">warning</span>
                                <span>This operation cannot be reversed. You can re-generate orders from the client subscription portal if needed.</span>
                            </div>

                            <div className="flex justify-center gap-3 pt-2">
                                <button 
                                    onClick={() => setDeleteConfirmInvoice(null)}
                                    disabled={isDeletingInvoice}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmDeleteInvoice}
                                    disabled={isDeletingInvoice}
                                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-red-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isDeletingInvoice ? (
                                        <>
                                            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            <span>Yes, Delete Invoice</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* PLAN CREATE / EDIT MODAL */}
                {planModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant space-y-4 animate-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[24px]">subscriptions</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-on-surface">
                                            {editingPlan ? `Edit Tier: ${editingPlan.displayName}` : 'Create New Subscription Tier'}
                                        </h3>
                                        <p className="text-xs text-on-surface-variant">
                                            Dynamic pricing & platform quotas. Seed values are not hardcoded.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPlanModalOpen(false)}
                                    disabled={isSavingPlan}
                                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Tier Internal Key *</label>
                                    <input
                                        type="text"
                                        value={planForm.name}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                                        disabled={!!editingPlan}
                                        placeholder="e.g. STARTER, PRO, CUSTOM"
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono disabled:opacity-60"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Public Display Name *</label>
                                    <input
                                        type="text"
                                        value={planForm.displayName}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, displayName: e.target.value }))}
                                        placeholder="e.g. Starter Plan"
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-medium"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Monthly Price (NPR) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-xs text-outline font-bold">Rs.</span>
                                        <input
                                            type="number"
                                            value={planForm.monthlyPrice}
                                            onChange={(e) => setPlanForm(prev => ({ ...prev, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-outline">Seed default: Starter 2000, Pro 5000, Enterprise 15000</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Annual Price (NPR) *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-xs text-outline font-bold">Rs.</span>
                                        <input
                                            type="number"
                                            value={planForm.annualPrice}
                                            onChange={(e) => setPlanForm(prev => ({ ...prev, annualPrice: parseFloat(e.target.value) || 0 }))}
                                            min={0}
                                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono font-bold"
                                        />
                                    </div>
                                    <p className="text-[10px] text-outline">MRR calculation will normalize this as price / 12</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Max Practitioners / Staff *</label>
                                    <input
                                        type="number"
                                        value={planForm.userLimit}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, userLimit: parseInt(e.target.value, 10) || 1 }))}
                                        min={1}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Monthly Appointment Limit</label>
                                    <input
                                        type="number"
                                        value={planForm.appointmentLimit}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, appointmentLimit: parseInt(e.target.value, 10) || 0 }))}
                                        placeholder="0 for unlimited"
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono"
                                    />
                                    <p className="text-[10px] text-outline">Enter 0 or -1 for unlimited</p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface">Plan Description</label>
                                <textarea
                                    value={planForm.description}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                    placeholder="Short summary of this tier's intended audience..."
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface">Features (Comma or Newline Separated)</label>
                                <textarea
                                    value={planForm.featuresRaw ?? (Array.isArray(planForm.features) ? planForm.features.join(', ') : '')}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        setPlanForm(prev => ({
                                            ...prev,
                                            featuresRaw: raw,
                                            features: raw.split(',').map(s => s.trim()).filter(Boolean)
                                        }));
                                    }}
                                    rows={3}
                                    placeholder="e.g. 5 Staff Accounts, SMS Reminders, Priority Support, Custom Branding"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface">
                                    <input
                                        type="checkbox"
                                        checked={planForm.active}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, active: e.target.checked }))}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    Active for New Signups & Upgrades
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface">
                                    <input
                                        type="checkbox"
                                        checked={planForm.isPopular}
                                        onChange={(e) => setPlanForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                                        className="w-4 h-4 rounded text-primary"
                                    />
                                    Highlighted / Most Popular Badge
                                </label>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setPlanModalOpen(false)}
                                    disabled={isSavingPlan}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-xs font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePlan}
                                    disabled={isSavingPlan}
                                    className="px-5 py-2 bg-primary hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isSavingPlan ? (
                                        <>
                                            <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                                            <span>Saving Tier...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[15px]">save</span>
                                            <span>Save Plan Tier</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TENANT SUSPEND MODAL */}
                {suspendModalTenant && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-left space-y-4 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">block</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-on-surface">Suspend Tenant Subscription</h3>
                                    <p className="text-xs text-on-surface-variant font-mono">{suspendModalTenant.organizationName || suspendModalTenant.name}</p>
                                </div>
                            </div>

                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
                                <div className="font-bold flex items-center gap-1 text-rose-900">
                                    <span className="material-symbols-outlined text-[16px]">warning</span>
                                    Immediate Renewal Gate Enforcement
                                </div>
                                <p className="leading-relaxed">
                                    Suspending will immediately lock the clinic dashboard behind the Renewal Gate, blocking all staff operations until reactivated or renewed.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Mandatory Suspension Reason *</label>
                                <textarea
                                    value={suspendReason}
                                    onChange={(e) => setSuspendReason(e.target.value)}
                                    placeholder="Explain why this clinic's subscription is being suspended (e.g. Terms violation, payment dispute)..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setSuspendModalTenant(null)}
                                    disabled={isSubmittingTenantAction}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-xs font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmSuspendTenant}
                                    disabled={isSubmittingTenantAction || !suspendReason.trim()}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingTenantAction ? 'Suspending...' : 'Confirm Suspension'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TENANT MANUAL EXTEND MODAL */}
                {extendModalTenant && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-primary/20 text-left space-y-4 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">more_time</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-on-surface">Grant Emergency Extension</h3>
                                    <p className="text-xs text-on-surface-variant font-mono">{extendModalTenant.organizationName || extendModalTenant.name}</p>
                                </div>
                            </div>

                            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/50 text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Current Plan:</span>
                                    <span className="font-bold text-on-surface">{extendModalTenant.planTier || extendModalTenant.subscriptionTier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Current Expiry:</span>
                                    <span className="font-mono font-bold text-on-surface">{extendModalTenant.expiryDate || extendModalTenant.subscriptionExpiryDate || 'Expired'}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Number of Days to Extend *</label>
                                <input
                                    type="number"
                                    value={extendDays}
                                    onChange={(e) => setExtendDays(parseInt(e.target.value, 10) || 1)}
                                    min={1}
                                    max={365}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono font-bold"
                                />
                                <p className="text-[10px] text-outline">Extension will be added to the current expiry date (or from today if already expired).</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">Reason for Emergency Extension *</label>
                                <textarea
                                    value={extendReason}
                                    onChange={(e) => setExtendReason(e.target.value)}
                                    placeholder="Enter administrative justification for granting this free grace extension..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setExtendModalTenant(null)}
                                    disabled={isSubmittingTenantAction}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-xs font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmExtendTenant}
                                    disabled={isSubmittingTenantAction || extendDays < 1}
                                    className="px-5 py-2 bg-primary hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmittingTenantAction ? 'Extending...' : 'Grant Extension'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXTENSION REVIEW MODAL */}
                {reviewModalRequest && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant text-left space-y-4 animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reviewApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        <span className="material-symbols-outlined text-[24px]">
                                            {reviewApproved ? 'verified' : 'cancel'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-on-surface">
                                            {reviewApproved ? 'Approve Extension Request' : 'Reject Extension Request'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getOrgTypeBadge(reviewModalRequest.organizationType).className}`}>
                                                <span className="material-symbols-outlined text-[11px]">{getOrgTypeBadge(reviewModalRequest.organizationType).icon}</span>
                                                {getOrgTypeBadge(reviewModalRequest.organizationType).label}
                                            </span>
                                            <p className="text-xs text-on-surface-variant font-mono">{reviewModalRequest.organizationName || reviewModalRequest.tenantName}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setReviewModalRequest(null)}
                                    disabled={isSubmittingReview}
                                    className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>

                            {/* Request Summary Card */}
                            <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 text-xs space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-on-surface-variant">Organization:</span>
                                    <span className="font-bold text-on-surface">{reviewModalRequest.organizationName || reviewModalRequest.tenantName} (PAN: {reviewModalRequest.registrationNumber || 'N/A'})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Current Plan:</span>
                                    <span className="font-bold text-on-surface">{reviewModalRequest.currentPlan || reviewModalRequest.currentPlanTier || 'Starter'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-on-surface-variant">Requested Days:</span>
                                    <span className="font-mono font-bold text-primary">{reviewModalRequest.requestedDays} Days</span>
                                </div>
                                <div>
                                    <span className="text-on-surface-variant block mb-1">Applicant Justification:</span>
                                    <p className="bg-white p-2.5 rounded-lg border border-outline-variant/40 italic text-on-surface">
                                        "{reviewModalRequest.reason}"
                                    </p>
                                </div>
                            </div>

                            {/* Approve / Reject Toggle */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setReviewApproved(true)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                        reviewApproved
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Approve Extension
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReviewApproved(false)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                        !reviewApproved
                                            ? 'bg-rose-50 border-rose-500 text-rose-800'
                                            : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                    Reject Request
                                </button>
                            </div>

                            {reviewApproved && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface block">Approved Grace Days *</label>
                                    <input
                                        type="number"
                                        value={reviewApprovedDays}
                                        onChange={(e) => setReviewApprovedDays(parseInt(e.target.value, 10) || 1)}
                                        min={1}
                                        max={60}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary font-mono font-bold"
                                    />
                                    <p className="text-[10px] text-outline">You may approve fewer or equal days than requested.</p>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface block">
                                    Reviewer Notes / Response to Administrator {reviewApproved ? '(Optional)' : '*'}
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder={reviewApproved ? "Any special instructions or conditions for this approval..." : "Provide explanation for why this extension cannot be approved..."}
                                    rows={2}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-surface-container">
                                <button
                                    type="button"
                                    onClick={() => setReviewModalRequest(null)}
                                    disabled={isSubmittingReview}
                                    className="px-4 py-2 border border-outline-variant rounded-xl text-on-surface text-xs font-semibold hover:bg-surface-container cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmReviewExtension}
                                    disabled={isSubmittingReview || (!reviewApproved && !reviewNotes.trim())}
                                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                        reviewApproved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                                    }`}
                                >
                                    {isSubmittingReview ? (
                                        'Saving...'
                                    ) : reviewApproved ? (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">check</span>
                                            Approve & Extend
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                            Reject Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
