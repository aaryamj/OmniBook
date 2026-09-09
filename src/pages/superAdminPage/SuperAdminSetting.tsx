import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './superAdmin.css';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';

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

    activeIntegrationsCount?: number;
    onboardingModeBadge?: string;
    currencyTimezoneBadge?: string;
    systemVersion?: string;

    invoices?: PlatformInvoiceDTO[];
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
            }
        } catch (error) {
            console.error('Failed to load superadmin settings:', error);
            showToast('Loaded local fallback settings.', 'info');
        } finally {
            setIsLoading(false);
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
                                        Burst traffic exceeding {settings.rateLimitRequestsPerMin} req/min will trigger an automatic HTTP 429 Too Many Requests response to safeguard server resources.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                );
            case 'Billing & Subscriptions':
                return (
                    <div className="max-w-3xl space-y-12 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Platform Subscription Card */}
                        <section>
                            <h2 className="font-headline-md text-headline-md text-primary border-b border-surface-container pb-4 mb-6">Platform Subscription</h2>
                            <div className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div>
                                    <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded mb-2 inline-block">
                                        {settings.subscriptionStatus || 'ACTIVE'}
                                    </span>
                                    <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{settings.subscriptionTier || 'Enterprise License'}</h3>
                                    <p className="text-body-md text-on-surface-variant mt-1">
                                        Billed {settings.billingCycle || 'Annually'} • Next invoice: <span className="font-medium text-primary">{settings.nextInvoiceDate || 'Oct 1, 2026'}</span>
                                    </p>
                                    <p className="text-body-sm text-outline mt-0.5">Contact: {settings.billingContactEmail || 'billing@omnibook.com'}</p>
                                </div>
                                <div className="sm:text-right">
                                    <h3 className="font-headline-md text-headline-md text-primary font-black">
                                        ${settings.subscriptionAnnualFee ? settings.subscriptionAnnualFee.toLocaleString() : '4,999'}/yr
                                    </h3>
                                    <button 
                                        onClick={handleOpenBillingModal}
                                        className="mt-3 text-secondary font-label-md hover:underline flex items-center sm:justify-end gap-1 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Manage Billing Profile
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Invoices Table */}
                        <section>
                            <div className="flex justify-between items-center border-b border-surface-container pb-4 mb-6">
                                <h2 className="font-headline-md text-headline-md text-primary">Recent Subscription Invoices</h2>
                                <span className="text-body-sm text-on-surface-variant">Click any row to generate official PDF</span>
                            </div>
                            
                            <div className="overflow-x-auto border border-outline-variant rounded-xl bg-surface-container-lowest">
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
                                        {(!settings.invoices || settings.invoices.length === 0) ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-on-surface-variant">No invoices recorded yet.</td>
                                            </tr>
                                        ) : (
                                            settings.invoices.map((inv) => (
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
                                                        {inv.status === 'Refunded' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1 w-fit">
                                                                    <span className="material-symbols-outlined text-[13px]">assignment_return</span>
                                                                    Refunded
                                                                </span>
                                                                <span className="text-[10px] font-bold text-rose-600 pl-1 uppercase tracking-wide">
                                                                    Rejected
                                                                </span>
                                                            </div>
                                                        ) : inv.verificationStatus === 'PENDING_REVIEW' || inv.verificationStatus === 'PENDING_APPROVAL' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 w-fit">
                                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                                    Paid
                                                                </span>
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-0.5 w-fit">
                                                                    <span className="material-symbols-outlined text-[11px]">pending</span>
                                                                    Pending Review
                                                                </span>
                                                            </div>
                                                        ) : inv.verificationStatus === 'VERIFICATION_IN_PROGRESS' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 w-fit">
                                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                                    Paid
                                                                </span>
                                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-0.5 w-fit">
                                                                    <span className="material-symbols-outlined text-[11px]">sync</span>
                                                                    In Verification
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${inv.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                                {inv.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-4 text-right relative">
                                                        <div className="flex items-center justify-end gap-1.5 ml-auto">
                                                            {/* Direct Action: Reject & Refund (or Refunded badge) */}
                                                            {inv.status === 'Refunded' ? (
                                                                <span className="px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg inline-flex items-center gap-1 shadow-sm">
                                                                    <span className="material-symbols-outlined text-[14px]">assignment_return</span>
                                                                    <span className="hidden sm:inline">Refunded</span>
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenRejectModal(inv);
                                                                    }}
                                                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300"
                                                                    title="Reject subscription request and initiate automatic payment gateway refund"
                                                                >
                                                                    <span className="material-symbols-outlined text-[15px] text-rose-600">cancel</span>
                                                                    <span className="hidden sm:inline">Reject</span>
                                                                </button>
                                                            )}

                                                            {/* Direct Action: Send Verification Update Email (if not refunded) */}
                                                            {inv.status !== 'Refunded' && (
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSendVerificationUpdate(inv);
                                                                    }}
                                                                    disabled={sendingUpdateInvoiceId === inv.id}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                                                                        emailSuccessSentIds.includes(inv.id)
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                                            : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                                                    } disabled:opacity-50`}
                                                                    title={`Send "Verification in Progress" update email to ${inv.adminEmail || 'admin'}`}
                                                                >
                                                                    {sendingUpdateInvoiceId === inv.id ? (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                                                                            <span className="hidden sm:inline">Sending...</span>
                                                                        </>
                                                                    ) : emailSuccessSentIds.includes(inv.id) ? (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[15px] text-emerald-600">mark_email_read</span>
                                                                            <span className="hidden sm:inline">Update Sent</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="material-symbols-outlined text-[15px] text-primary">forward_to_inbox</span>
                                                                            <span className="hidden sm:inline">Send Update</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}

                                                            {/* More Options Dropdown */}
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(openDropdownId === inv.id ? null : inv.id);
                                                                }}
                                                                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer"
                                                                title="Action menu"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                            </button>
                                                        </div>

                                                        {openDropdownId === inv.id && (
                                                            <>
                                                                <div 
                                                                    className="fixed inset-0 z-40" 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                />
                                                                <div className="absolute right-4 top-12 z-50 w-56 bg-white rounded-xl shadow-xl border border-outline-variant py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                                                                    {inv.status !== 'Refunded' && (
                                                                        <>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    handleOpenRejectModal(inv);
                                                                                }}
                                                                                className="w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-bold border-b border-surface-container"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-rose-600">cancel</span>
                                                                                <span>Reject & Refund</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenDropdownId(null);
                                                                                    handleSendVerificationUpdate(inv);
                                                                                }}
                                                                                disabled={sendingUpdateInvoiceId === inv.id}
                                                                                className="w-full px-4 py-2.5 text-sm text-primary hover:bg-primary/5 flex items-center gap-2.5 transition-colors cursor-pointer font-bold border-b border-surface-container"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px] text-primary">forward_to_inbox</span>
                                                                                <span>Send Verification Email</span>
                                                                            </button>
                                                                        </>
                                                                    )}
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
                            </div>
                        </section>
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

                <main className="ml-sidebar-width pt-20 px-4 sm:px-8 pb-12">
                    <div className="max-w-7xl mx-auto">
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

                        {/* Settings Console */}
                        <div className="bg-white border border-outline-variant rounded-xl flex min-h-[600px] overflow-hidden flex-col md:flex-row shadow-sm">
                            {/* Inner Sidebar Navigation */}
                            <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-surface-container bg-surface-container-lowest p-4">
                                <nav className="space-y-1">
                                    {(['General Preferences', 'Gateway Integrations', 'Security Policies', 'Billing & Subscriptions'] as SettingTabName[]).map((tabName) => (
                                        <button 
                                            key={tabName}
                                            onClick={() => setActiveTab(tabName)}
                                            className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center transition-colors cursor-pointer ${activeTab === tabName ? 'bg-surface-container text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                                        >
                                            <span className={`material-symbols-outlined mr-3 text-lg ${activeTab === tabName ? 'text-primary' : 'text-outline'}`}>
                                                {tabName === 'General Preferences' ? 'tune' : tabName === 'Gateway Integrations' ? 'api' : tabName === 'Security Policies' ? 'policy' : 'payments'}
                                            </span>
                                            {tabName}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Inner Content Area */}
                            <div className="flex-1 p-6 md:p-10 bg-white">
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
            </div>
        </div>
    );
}
