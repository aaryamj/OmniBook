import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getOrganizationTerms, normalizeOrgType } from '../utils/organizationTerms';
import { useAuth } from '../context/AuthContext';

interface PlanConfig {
  id: string;
  title: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'Starter',
    title: 'Starter',
    monthlyPrice: 2000,
    annualPrice: 20400, // ~15% discount
    description: 'Perfect for solo professionals, small clinics, salon studios, and specialized practitioners getting started.',
    features: [
      '3 Active Service Providers / Staff',
      '1 Operating Branch or Facility',
      'Online Appointment Booking Calendar',
      'Automated Email Confirmations & Alerts',
      'Client Self-Scheduling Portal',
      'Standard Support (Email)'
    ]
  },
  {
    id: 'Professional',
    title: 'Professional',
    monthlyPrice: 5000,
    annualPrice: 51000, // ~15% discount
    description: 'Advanced appointment scheduling, automated alerts, and analytics for growing clinics, salons, colleges, and practices.',
    isPopular: true,
    features: [
      '15 Active Service Providers / Specialists',
      'Multi-Branch & Location Management',
      'AI Scheduling Chatbot for Client Bookings',
      'WebSockets Real-Time Calendar Sync',
      'Automated SMS & WhatsApp Alerts',
      'Advanced KPI, Revenue & Attendance Dashboard',
      'Audit Trail & Staff Delegated Access',
      'Priority 24/7 Dedicated Support'
    ]
  },
  {
    id: 'Enterprise',
    title: 'Enterprise',
    monthlyPrice: 15000,
    annualPrice: 153000, // ~15% discount
    description: 'Custom, high-throughput solutions for multi-location institutions, colleges, hospital networks, and large organizations.',
    features: [
      'Unlimited Providers, Specialists & Staff',
      'Unlimited Branches, Campuses & Operating Rooms',
      'QR Code Visitor / Client Check-In & Queuing',
      'Integrated Video Consultations & Virtual Appointments',
      'Dedicated Customer Success Manager',
      'Full REST API & Webhooks Access',
      'Custom SLA & Enterprise Security Audit',
      'White-Glove Onboarding & Workflow Migration'
    ]
  }
];

interface PurchaseSuccessData {
  orderNumber: string;
  invoiceNumber: string;
  organizationName: string;
  organizationType?: string;
  registrationNumber?: string;
  address?: string;
  adminFullName?: string;
  adminEmail?: string;
  adminPhone?: string;
  transactionId?: string;
  verificationStatus?: string;
  planTier: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  paymentMethod: string;
  status: string;
}

const PricingPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual'>('Monthly');
  const [plans, setPlans] = useState<PlanConfig[]>(DEFAULT_PLANS);
  
  // Checkout Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig>(DEFAULT_PLANS[1]);
  const [modalStep, setModalStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseSuccessData | null>(null);

  // Form state - universal for Clinic, College, Saloon, Other Organization
  const [form, setForm] = useState({
    organizationName: '',
    organizationType: 'Clinic',
    customOrganizationType: '',
    registrationNumber: '',
    address: '',
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
    paymentMethod: 'eSewa',
    bankRef: 'NIMB-NPR-984210',
    termsAgreed: true
  });

  // Prefill form if admin user is logged in
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        organizationName: prev.organizationName || user.organizationName || '',
        organizationType: prev.organizationType || user.organizationType || 'Clinic',
        adminFullName: prev.adminFullName || user.fullName || '',
        adminEmail: prev.adminEmail || user.email || '',
        adminPhone: prev.adminPhone || user.phone || ''
      }));

      // If user is admin, fetch overview to auto-fill registration number and address
      const token = localStorage.getItem('token');
      if (token && user.role === 'admin') {
        axios.get('http://localhost:8080/api/v1/subscriptions/my-overview', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (res.data) {
            setForm(prev => ({
              ...prev,
              organizationName: res.data.organizationName || prev.organizationName,
              organizationType: res.data.organizationType || prev.organizationType,
              registrationNumber: res.data.registrationNumber || prev.registrationNumber,
              address: res.data.address || prev.address
            }));
          }
        }).catch(() => {});
      }
    }
  }, [user]);

  // Fetch dynamic plans from database catalog
  useEffect(() => {
    axios.get('http://localhost:8080/api/v1/subscriptions/plans')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: PlanConfig[] = res.data.map((p: any) => ({
            id: p.name,
            title: p.displayName || p.name,
            monthlyPrice: p.monthlyPrice,
            annualPrice: p.annualPrice,
            description: p.description,
            features: p.features || [],
            isPopular: p.isPopular
          }));
          setPlans(mapped);
          setSelectedPlan(prev => mapped.find(m => m.id === prev.id) || mapped[0]);
        }
      })
      .catch(err => {
        console.warn('Using default plans catalog fallback:', err);
      });
  }, []);

  // Check for returning payment redirect parameters (eSewa / Stripe callbacks)
  useEffect(() => {
    const isSuccess = searchParams.get('subscription_success') === 'true';
    const orderNum = searchParams.get('order_number');
    const paymentParam = searchParams.get('payment');

    if (isSuccess && orderNum) {
      axios.get(`http://localhost:8080/api/v1/subscriptions/order/${orderNum}`)
        .then(res => {
          if (res.data && res.data.success) {
            setPurchaseResult(res.data);
            setIsModalOpen(true);
            setModalStep(4); // Success step with verified invoice
            if (refreshUser) {
              refreshUser();
            }
          }
        })
        .catch(err => {
          console.error("Failed to fetch verified subscription order", err);
          setErrorMessage("Subscription verified, but failed to load order receipt. Please check your admin email or contact support.");
          setIsModalOpen(true);
        });
    } else if (paymentParam === 'failed') {
      const err = searchParams.get('error') || 'Payment authorization was rejected or not completed.';
      setErrorMessage(`Payment failed: ${err}. Please try again.`);
      setIsModalOpen(true);
      setModalStep(3);
    } else if (paymentParam === 'cancelled') {
      setErrorMessage('Payment process was cancelled. You can retry with eSewa, Stripe Card, or Bank Transfer.');
      setIsModalOpen(true);
      setModalStep(3);
    }
  }, [searchParams, refreshUser]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.pricing-card').forEach(card => {
      card.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const openCheckout = (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setModalStep(1);
    setErrorMessage('');
    setPurchaseResult(null);
    setIsModalOpen(true);
  };

  const closeCheckout = () => {
    setIsModalOpen(false);
    setModalStep(1);
    setErrorMessage('');
    setPurchaseResult(null);
  };

  const currentPrice = billingCycle === 'Monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;

  const handleNextStep = () => {
    setErrorMessage('');
    if (modalStep === 1) {
      if (!form.organizationName.trim()) {
        setErrorMessage('Please enter your organization name.');
        return;
      }
      if (form.organizationType === 'Other Organization' && !form.customOrganizationType.trim()) {
        setErrorMessage('Please specify your organization type.');
        return;
      }
      if (!form.registrationNumber.trim()) {
        setErrorMessage('Please provide your business registration or PAN number.');
        return;
      }
      if (!form.address.trim()) {
        setErrorMessage('Please provide your physical address or location.');
        return;
      }
      setModalStep(2);
    } else if (modalStep === 2) {
      if (!form.adminFullName.trim()) {
        setErrorMessage('Please provide the Administrator full name.');
        return;
      }
      if (!form.adminEmail.trim() || !form.adminEmail.includes('@')) {
        setErrorMessage('Please enter a valid administrator email address for invitation.');
        return;
      }
      if (!form.adminPhone.trim()) {
        setErrorMessage('Please enter a contact phone number.');
        return;
      }
      setModalStep(3);
    }
  };

  const handleCompletePayment = async () => {
    setErrorMessage('');
    if (!form.termsAgreed) {
      setErrorMessage('You must agree to the subscription terms to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveOrgType = form.organizationType === 'Other Organization' 
        ? form.customOrganizationType.trim() 
        : form.organizationType;

      const payload = {
        organizationName: form.organizationName.trim(),
        organizationType: effectiveOrgType,
        registrationNumber: form.registrationNumber.trim(),
        address: form.address.trim(),
        adminFullName: form.adminFullName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPhone: form.adminPhone.trim(),
        planTier: selectedPlan.title,
        billingCycle: billingCycle,
        amount: currentPrice,
        currency: 'NPR',
        paymentMethod: form.paymentMethod
      };

      const res = await axios.post('http://localhost:8080/api/v1/subscriptions/initiate', payload);
      if (res.data && res.data.success) {
        const { gatewayUrl, formData, directSuccess, orderNumber, invoiceNumber } = res.data;

        if (formData && gatewayUrl) {
          // eSewa ePay v2 form submit redirect
          const formEl = document.createElement('form');
          formEl.method = 'POST';
          formEl.action = gatewayUrl;
          
          for (const key in formData) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = formData[key];
            formEl.appendChild(hiddenField);
          }
          
          document.body.appendChild(formEl);
          formEl.submit();
        } else if (gatewayUrl) {
          // Stripe Checkout direct URL redirect
          window.location.href = gatewayUrl;
        } else if (directSuccess) {
          // Bank Transfer or direct offline flow
          try {
            const orderRes = await axios.get(`http://localhost:8080/api/v1/subscriptions/order/${orderNumber}`);
            if (orderRes.data && orderRes.data.success) {
              setPurchaseResult(orderRes.data);
            }
          } catch {
            setPurchaseResult({
              orderNumber: orderNumber,
              invoiceNumber: invoiceNumber || 'INV-PENDING',
              organizationName: form.organizationName.trim(),
              organizationType: effectiveOrgType,
              registrationNumber: form.registrationNumber.trim(),
              address: form.address.trim(),
              adminFullName: form.adminFullName.trim(),
              adminEmail: form.adminEmail.trim(),
              adminPhone: form.adminPhone.trim(),
              transactionId: orderNumber,
              verificationStatus: 'PENDING_REVIEW',
              planTier: selectedPlan.title,
              amount: currentPrice,
              currency: 'NPR',
              billingPeriod: billingCycle,
              paymentMethod: form.paymentMethod,
              status: 'Paid'
            });
          }
          setModalStep(4); // Success step
        }
      } else {
        setErrorMessage(res.data?.message || 'Payment initiation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || 'Transaction could not be processed. Please check your network and retry.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate Official PDF Receipt for the customer
  const handleDownloadCustomerInvoice = () => {
    if (!purchaseResult) return;
    try {
      const doc = new jsPDF();

      // Brand Top Bar
      doc.setFillColor(24, 83, 217); // Primary Blue
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('OmniBook Subscription Receipt', 14, 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Smart Enterprise Appointment Booking & Resource Scheduling Platform', 14, 30);

      doc.setFontSize(13);
      doc.text('PAID & REGISTERED', 196, 22, { align: 'right' });
      doc.setFontSize(9);
      doc.text(`Order: ${purchaseResult.orderNumber}`, 196, 30, { align: 'right' });

      // Customer and Order Meta
      const effectiveOrgType = purchaseResult.organizationType || 
        (form.organizationType === 'Other Organization' ? form.customOrganizationType.trim() : form.organizationType) || 
        'Clinic';
      const terms = getOrganizationTerms(effectiveOrgType);
      const regNo = purchaseResult.registrationNumber || form.registrationNumber || 'N/A';
      const adminName = purchaseResult.adminFullName || form.adminFullName || 'Administrator';
      const adminEmail = purchaseResult.adminEmail || form.adminEmail || 'N/A';
      const adminPhone = purchaseResult.adminPhone || form.adminPhone || 'N/A';
      const address = purchaseResult.address || form.address || 'N/A';

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Billed To (Subscriber):', 14, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Organization: ${purchaseResult.organizationName} (${effectiveOrgType})`, 14, 59);
      doc.text(`${terms.registrationLabel || 'Registration / PAN'}: ${regNo}`, 14, 65);
      doc.text(`Administrator: ${adminName}`, 14, 71);
      doc.text(`Email: ${adminEmail} | Phone: ${adminPhone}`, 14, 77);
      doc.text(`Address: ${address}`, 14, 83);

      doc.setFont('helvetica', 'bold');
      doc.text('Subscription Details:', 130, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: ${purchaseResult.invoiceNumber}`, 130, 59);
      doc.text(`Order No: ${purchaseResult.orderNumber}`, 130, 65);
      doc.text(`Transaction ID: ${purchaseResult.transactionId || purchaseResult.orderNumber}`, 130, 71);
      doc.text(`Payment Gateway: ${purchaseResult.paymentMethod}`, 130, 77);
      doc.text(`Billing Cycle: ${billingCycle}`, 130, 83);

      // Line items table
      const items = [
        [
          '1',
          `${purchaseResult.planTier} Plan (${billingCycle})`,
          purchaseResult.billingPeriod || `${billingCycle} Cycle`,
          `Rs. ${purchaseResult.amount.toLocaleString()}`,
          `Rs. ${purchaseResult.amount.toLocaleString()}`
        ]
      ];

      autoTable(doc, {
        startY: 94,
        head: [['#', 'Subscription Item', 'Billing Period', 'Unit Price', 'Total']],
        body: items,
        theme: 'striped',
        headStyles: { fillColor: [24, 83, 217], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 5 }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 140, finalY);
      doc.text(`Rs. ${purchaseResult.amount.toLocaleString()}`, 196, finalY, { align: 'right' });

      doc.text('Tax / VAT (0%):', 140, finalY + 6);
      doc.text('Rs. 0', 196, finalY + 6, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total Paid:', 140, finalY + 14);
      doc.text(`Rs. ${purchaseResult.amount.toLocaleString()}`, 196, finalY + 14, { align: 'right' });

      // Verification notice box
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(34, 197, 94);
      doc.rect(14, finalY + 5, 110, 26, 'FD');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS: PAID & PENDING AUDIT APPROVAL', 18, finalY + 13);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Our Super Admin team verifies the registration details.', 18, finalY + 20);
      doc.text(`Activation invite will arrive at ${form.adminEmail}.`, 18, finalY + 26);

      doc.save(`${purchaseResult.invoiceNumber}_OmniBook.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
    }
  };

  return (
    <div className="bg-surface text-on-background font-sans selection:bg-[#1a56db]/20 selection:text-[#1a56db] overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-10 pt-16 md:pt-24 pb-16 mt-20">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Universal Appointment Booking & Resource Management
          </div>
          <h1 className="text-4xl md:text-[56px] font-bold text-primary mb-6 max-w-4xl mx-auto leading-[1.1] tracking-tight">
            Simple, Transparent Pricing for Any Organization
          </h1>
          <p className="text-base md:text-lg text-secondary max-w-3xl mx-auto leading-relaxed">
            From medical clinics and colleges to beauty salons, wellness centers, and enterprise service providers—OmniBook scales with your appointment booking and scheduling needs. Choose a plan below to register and activate your organization workspace.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center bg-[#f0f3ff] p-1.5 rounded-2xl border border-[#dce2f3]">
            <button
              onClick={() => setBillingCycle('Monthly')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                billingCycle === 'Monthly'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('Annual')}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                billingCycle === 'Annual'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                billingCycle === 'Annual' ? 'bg-[#6ffbbe] text-[#002113]' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Save 15%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((plan) => {
            const price = billingCycle === 'Monthly' ? plan.monthlyPrice : plan.annualPrice;
            const isPro = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`pricing-card p-8 rounded-[20px] flex flex-col relative overflow-hidden transition-all duration-300 ${
                  isPro
                    ? 'bg-primary text-white shadow-[0_20px_40px_rgba(24,83,217,0.25)] md:scale-105 z-10'
                    : 'bg-white text-on-background border border-[#e2e8f0] shadow-sm hover:shadow-xl'
                }`}
              >
                {isPro && (
                  <div className="absolute top-4 right-4 bg-[#6ffbbe] text-[#002113] font-bold px-3 py-1 rounded-full text-[12px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isPro ? 'text-white' : 'text-primary'}`}>
                    {plan.title}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-primary'}`}>
                      Rs. {price.toLocaleString()}
                    </span>
                    <span className={`text-sm ${isPro ? 'text-white/80' : 'text-[#53606c]'}`}>
                      /{billingCycle === 'Monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  <p className={`text-sm mt-2 leading-relaxed ${isPro ? 'text-white/90' : 'text-[#53606c]'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className={`h-px w-full my-4 ${isPro ? 'bg-white/20' : 'bg-[#e2e8f0]'}`} />

                <ul className="flex-grow space-y-3.5 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[20px] ${isPro ? 'text-[#6ffbbe]' : 'text-[#006f4b]'}`}>
                        check_circle
                      </span>
                      <span className={`text-sm ${isPro ? 'text-white font-medium' : 'text-secondary'}`}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openCheckout(plan)}
                  className={`w-full py-4 px-6 rounded-[14px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    isPro
                      ? 'bg-[#006f4b] hover:bg-[#005438] text-white shadow-emerald-900/30'
                      : 'bg-primary hover:bg-primary/90 text-white shadow-blue-900/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                  <span>{plan.id === 'Enterprise' ? 'Get Enterprise Plan' : `Choose ${plan.title}`}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-on-background text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-primary mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">corporate_fare</span>
                Is OmniBook suitable for organizations other than clinics?
              </h4>
              <p className="text-base text-secondary leading-relaxed">
                Yes! OmniBook is built from the ground up for any appointment and scheduling-driven organization—including educational colleges (faculty hours & lab appointments), beauty salons & spas (stylist bookings), medical practices, sports & fitness facilities, and professional service agencies.
              </p>
            </div>
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-primary mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">verified_user</span>
                How does the onboarding and invitation process work?
              </h4>
              <p className="text-base text-secondary leading-relaxed">
                When you purchase a plan, your organization details are submitted for verification. You do not need to enter a password during checkout. Once our Super Admin team confirms your organization registration/PAN, an official activation invitation link will be delivered directly to your administrator email to securely initialize your admin credentials.
              </p>
            </div>
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-primary mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">receipt_long</span>
                Will I receive an official tax invoice?
              </h4>
              <p className="text-base text-secondary leading-relaxed">
                Yes! As soon as your payment is processed, a permanent invoice record is saved with your organization name, registration number, and invoice number. You can download the PDF receipt immediately after checkout, and it will also appear in your billing dashboard.
              </p>
            </div>
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-primary mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">payments</span>
                Which payment gateways are supported in Nepal?
              </h4>
              <p className="text-base text-secondary leading-relaxed">
                We natively support eSewa Mobile Wallet, Khalti Digital Wallet, Visa / MasterCard credit cards, and ConnectIPS / Direct Bank Settlement.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* CHECKOUT / PRE-PAYMENT & PAYMENT DETAIL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg md:max-w-xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-primary px-5 py-3.5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                {modalStep === 4 && purchaseResult ? (
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                        Payment Completed
                      </span>
                      <span className="text-white/70 text-xs font-mono">
                        #{purchaseResult.orderNumber}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      Subscription Payment Details & Receipt
                    </h3>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold uppercase tracking-wider">
                        {selectedPlan.title} Plan ({billingCycle})
                      </span>
                      <span className="text-white/80 text-xs font-medium">
                        Rs. {currentPrice.toLocaleString()} {billingCycle === 'Monthly' ? '/mo' : '/yr'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mt-0.5 text-white">Organization Subscription Checkout</h3>
                  </div>
                )}
              </div>
              <button
                onClick={closeCheckout}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Steps Indicator (Steps 1-3) */}
            {modalStep < 4 && (
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex-shrink-0">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <div className={`flex items-center gap-1.5 ${modalStep === 1 ? 'text-primary font-bold' : modalStep > 1 ? 'text-emerald-600' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      modalStep === 1 ? 'bg-primary text-white' : modalStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {modalStep > 1 ? '✓' : '1'}
                    </span>
                    <span>Organization Info</span>
                  </div>
                  <div className="w-8 h-px bg-slate-200" />
                  <div className={`flex items-center gap-1.5 ${modalStep === 2 ? 'text-primary font-bold' : modalStep > 2 ? 'text-emerald-600' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      modalStep === 2 ? 'bg-primary text-white' : modalStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {modalStep > 2 ? '✓' : '2'}
                    </span>
                    <span>Admin Contact</span>
                  </div>
                  <div className="w-8 h-px bg-slate-200" />
                  <div className={`flex items-center gap-1.5 ${modalStep === 3 ? 'text-primary font-bold' : ''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      modalStep === 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      3
                    </span>
                    <span>Payment</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body - Scrollable and constrained inside viewport */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-left space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: ORGANIZATION INFO */}
              {modalStep === 1 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.organizationName}
                      onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                      placeholder={
                        form.organizationType === 'Clinic' ? 'e.g., MediCare Specialty Clinic & Hospital' :
                        form.organizationType === 'College' ? 'e.g., Apex International College & Academy' :
                        form.organizationType === 'Saloon' ? 'e.g., Studio Luxe Beauty & Hair Spa' :
                        form.organizationType === 'Fitness' ? 'e.g., PowerFit Gym & CrossFit Arena' :
                        form.organizationType === 'Consulting' ? 'e.g., Vertex Corporate Advisory & Legal' :
                        'e.g., Prime Global Enterprise Solutions'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Organization Type <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.organizationType}
                          onChange={(e) => setForm({ ...form, organizationType: e.target.value })}
                          className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-semibold bg-white cursor-pointer"
                        >
                          <option value="Clinic">Medical & Healthcare Clinic</option>
                          <option value="College">Academic & Educational College</option>
                          <option value="Saloon">Beauty Salon, Spa & Wellness</option>
                          <option value="Fitness">Gym, Fitness & Sports Center</option>
                          <option value="Consulting">Legal & Corporate Consultancy</option>
                          <option value="Other Organization">Other Organization / Enterprise</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2.5 top-2 pointer-events-none text-slate-500 text-[18px]">
                          expand_more
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        {form.organizationType === 'Clinic' ? 'Medical Reg / PAN No. *' :
                         form.organizationType === 'College' ? 'Accreditation / PAN No. *' :
                         form.organizationType === 'Saloon' ? 'Salon Reg / PAN No. *' :
                         form.organizationType === 'Fitness' ? 'Gym License / PAN No. *' :
                         form.organizationType === 'Consulting' ? 'Corporate Reg / PAN No. *' :
                         'Registration / PAN No. *'}
                      </label>
                      <input
                        type="text"
                        value={form.registrationNumber}
                        onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                        placeholder={
                          form.organizationType === 'Clinic' ? 'e.g., MED-609823 or PAN' :
                          form.organizationType === 'College' ? 'e.g., EDU-402918 or PAN' :
                          form.organizationType === 'Saloon' ? 'e.g., SAL-801293 or PAN' :
                          'e.g., PAN-609823145 or Reg No.'
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Dynamic Custom Organization Type input when 'Other Organization' is selected */}
                  {form.organizationType === 'Other Organization' && (
                    <div className="animate-in fade-in duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Specify Organization Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.customOrganizationType}
                        onChange={(e) => setForm({ ...form, customOrganizationType: e.target.value })}
                        placeholder="e.g., Government Organization, Fitness Center, Consulting Firm"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Address / Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">location_on</span>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="e.g., Bhaisepati, Lalitpur, Nepal"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Continue to Admin Contact</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADMINISTRATOR CONTACT */}
              {modalStep === 2 && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="material-symbols-outlined text-[18px] text-blue-600 shrink-0 mt-0.5">info</span>
                    <div>
                      <strong className="block text-xs font-bold text-blue-950 mb-0.5">Password Configured Post-Audit</strong>
                      After payment, our Super Admin reviews your organization details and dispatches an activation invitation link to your admin email address to securely configure credentials.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Administrator Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.adminFullName}
                      onChange={(e) => setForm({ ...form, adminFullName: e.target.value })}
                      placeholder={
                        form.organizationType === 'Clinic' ? 'e.g., Dr. Ramesh Sharma (Medical Director)' :
                        form.organizationType === 'College' ? 'e.g., Prof. Sunita KC (Principal / Dean)' :
                        form.organizationType === 'Saloon' ? 'e.g., Priya Shrestha (Salon Owner / Master)' :
                        form.organizationType === 'Fitness' ? 'e.g., Bikram Thapa (Head Coach / Manager)' :
                        'e.g., Suman Adhikari (Director / Administrator)'
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Admin Email (For Invitation) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">mail</span>
                        <input
                          type="email"
                          value={form.adminEmail}
                          onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                          placeholder="admin@organization.com"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-[18px]">call</span>
                        <input
                          type="tel"
                          value={form.adminPhone}
                          onChange={(e) => setForm({ ...form, adminPhone: e.target.value })}
                          placeholder="+977-9800000000"
                          className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-3.5 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Proceed to Payment</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD & REVIEW */}
              {modalStep === 3 && (
                <div className="space-y-3.5">
                  {/* Order summary bar */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Total Amount Due</span>
                      <span className="text-xl font-black text-primary">Rs. {currentPrice.toLocaleString()}</span>
                      <span className="text-slate-500 ml-1 text-[11px]">({selectedPlan.title} • {billingCycle})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium block text-[11px]">Subscriber</span>
                      <span className="font-bold text-slate-800 text-xs">
                        {form.organizationName}
                        <span className="text-slate-500 font-normal block text-[10px]">
                          ({form.organizationType === 'Other Organization' ? form.customOrganizationType : form.organizationType})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Payment Gateway Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Select Payment Gateway <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'eSewa', label: 'eSewa Pay', icon: 'account_balance_wallet', color: 'text-green-600', badge: 'Domestic' },
                        { id: 'Card', label: 'Stripe Card', icon: 'credit_card', color: 'text-blue-600', badge: 'International' },
                        { id: 'Bank Transfer', label: 'Bank Wire', icon: 'account_balance', color: 'text-slate-700', badge: 'Offline' }
                      ].map((gw) => (
                        <button
                          key={gw.id}
                          type="button"
                          onClick={() => setForm({ ...form, paymentMethod: gw.id })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer text-center relative ${
                            form.paymentMethod === gw.id
                              ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 font-bold shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-[22px] ${gw.color}`}>{gw.icon}</span>
                          <span className="text-xs font-bold">{gw.label}</span>
                          <span className="text-[10px] text-slate-400">{gw.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gateway Specific Live Info */}
                  {form.paymentMethod === 'eSewa' && (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-green-900 text-xs">
                        <span className="material-symbols-outlined text-[17px] text-green-600">verified</span>
                        eSewa ePay v2 Gateway
                      </div>
                      <p className="text-green-800 text-[11px] leading-relaxed">
                        Redirects securely to <strong>eSewa Sandbox Gateway</strong> (<span className="font-mono bg-green-100 px-1 py-0.5 rounded">rc-epay.esewa.com.np</span>) with encrypted payload.
                      </p>
                      <div className="bg-white/80 p-2 rounded-lg border border-green-200/60 font-mono text-[10px] text-slate-700">
                        ID: <span className="font-bold">9849511152</span> | MPIN: <span className="font-bold">1122</span>
                      </div>
                    </div>
                  )}

                  {form.paymentMethod === 'Card' && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                        <span className="material-symbols-outlined text-[17px] text-blue-600">lock</span>
                        Stripe International Checkout
                      </div>
                      <p className="text-blue-800 text-[11px] leading-relaxed">
                        Redirects securely to <strong>Stripe Checkout Portal</strong> with 256-bit encryption. Visa & MasterCard accepted.
                      </p>
                      <div className="bg-white/80 p-2 rounded-lg border border-blue-200/60 font-mono text-[10px] text-slate-700">
                        Card: <span className="font-bold">4242 •••• •••• 4242</span> | CVC: <span className="font-bold">123</span>
                      </div>
                    </div>
                  )}

                  {form.paymentMethod === 'Bank Transfer' && (
                    <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <span className="material-symbols-outlined text-[17px] text-slate-600">account_balance</span>
                        Direct Bank Settlement
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-300 font-mono text-[10px] text-slate-700 leading-tight">
                        <strong>Bank:</strong> Nepal Investment Mega Bank (NIMB)<br />
                        <strong>A/C:</strong> 00100101928374 (OmniBook Pvt. Ltd.)
                      </div>
                      <div>
                        <label className="block text-slate-600 font-bold text-[11px] mb-0.5">Voucher Reference:</label>
                        <input
                          type="text"
                          value={form.bankRef}
                          onChange={(e) => setForm({ ...form, bankRef: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={form.termsAgreed}
                      onChange={(e) => setForm({ ...form, termsAgreed: e.target.checked })}
                      className="mt-0.5 rounded text-primary focus:ring-primary/20"
                    />
                    <span className="text-[11px] leading-snug">
                      I confirm organization & tax details are valid and authorize payment of <strong>Rs. {currentPrice.toLocaleString()}</strong>.
                    </span>
                  </label>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => setModalStep(2)}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleCompletePayment}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                          <span>Connecting Gateway...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                          <span>
                            {form.paymentMethod === 'eSewa' ? `Pay via eSewa (Rs. ${currentPrice.toLocaleString()})` :
                             form.paymentMethod === 'Card' ? `Pay via Stripe (Rs. ${currentPrice.toLocaleString()})` :
                             `Confirm Bank Transfer`}
                          </span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT DETAIL MODAL (DYNAMICALLY TAILORED FOR MULTI-TYPE ORGANIZATIONS) */}
              {modalStep === 4 && purchaseResult && (() => {
                const effectiveOrgType = purchaseResult.organizationType || 
                  (form.organizationType === 'Other Organization' ? form.customOrganizationType.trim() : form.organizationType) || 
                  'Clinic';
                const terms = getOrganizationTerms(effectiveOrgType);
                const norm = normalizeOrgType(effectiveOrgType);

                // Organization type theme and labels
                const orgMeta = norm === 'College' ? {
                  label: 'Academic & Educational Institution',
                  icon: 'school',
                  themeBg: 'bg-blue-50',
                  themeBorder: 'border-blue-200',
                  themeText: 'text-blue-700',
                  regTitle: 'Accreditation / Business PAN',
                  roleDesc: 'Principal / Academic Administrator'
                } : norm === 'Saloon' ? {
                  label: 'Beauty Salon, Spa & Wellness Studio',
                  icon: 'content_cut',
                  themeBg: 'bg-pink-50',
                  themeBorder: 'border-pink-200',
                  themeText: 'text-pink-700',
                  regTitle: 'Salon Reg / Trade License',
                  roleDesc: 'Salon Master / Studio Owner'
                } : norm === 'Other' ? {
                  label: effectiveOrgType.toLowerCase().includes('fitness') || effectiveOrgType.toLowerCase().includes('gym')
                    ? 'Gym, Fitness & Sports Center'
                    : 'Enterprise & Professional Services',
                  icon: effectiveOrgType.toLowerCase().includes('fitness') || effectiveOrgType.toLowerCase().includes('gym')
                    ? 'fitness_center'
                    : 'domain',
                  themeBg: 'bg-purple-50',
                  themeBorder: 'border-purple-200',
                  themeText: 'text-purple-700',
                  regTitle: 'Business Registration / PAN No.',
                  roleDesc: 'Managing Director / Corporate Administrator'
                } : {
                  label: 'Medical Healthcare & Specialty Clinic',
                  icon: 'local_hospital',
                  themeBg: 'bg-emerald-50',
                  themeBorder: 'border-emerald-200',
                  themeText: 'text-emerald-700',
                  regTitle: 'Medical Board Reg / Business PAN',
                  roleDesc: 'Medical Director / Clinic Admin'
                };

                return (
                  <div className="space-y-3.5 text-left animate-in fade-in duration-200">
                    {/* Top Status Banner */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[22px]">verified</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-emerald-950">Payment Settled & Confirmed</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            Verified
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 truncate">
                          Order #{purchaseResult.orderNumber} • Invoice #{purchaseResult.invoiceNumber} • Txn ID: {purchaseResult.transactionId || purchaseResult.orderNumber}
                        </p>
                      </div>
                    </div>

                    {/* Organization Profile Card (Tailored to Selected Organization Type) */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-primary">domain</span>
                          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                            Subscribed Organization
                          </h4>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${orgMeta.themeBg} ${orgMeta.themeText} ${orgMeta.themeBorder}`}>
                          <span className="material-symbols-outlined text-[13px]">{orgMeta.icon}</span>
                          <span>{orgMeta.label}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Organization Name</span>
                          <span className="font-bold text-slate-900 text-xs">{purchaseResult.organizationName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">{orgMeta.regTitle}</span>
                          <span className="font-mono font-semibold text-slate-800 text-xs">
                            {purchaseResult.registrationNumber || form.registrationNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Administrator In-Charge</span>
                          <span className="font-semibold text-slate-900 text-xs">
                            {purchaseResult.adminFullName || form.adminFullName}
                            <span className="text-slate-500 font-normal block text-[10px]">({orgMeta.roleDesc})</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Invitation Link Sent To</span>
                          <span className="font-medium text-primary text-xs break-all">
                            {purchaseResult.adminEmail || form.adminEmail}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Facility Location</span>
                          <span className="font-medium text-slate-800 text-xs">
                            {purchaseResult.address || form.address || 'Kathmandu Valley, Nepal'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Contact Phone</span>
                          <span className="font-medium text-slate-800 text-xs">
                            {purchaseResult.adminPhone || form.adminPhone || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tailored Workspace Modules Configuration */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">tune</span>
                        <span>Configured Workspace Features for {effectiveOrgType}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[13px] text-primary">{terms.providersNavIcon}</span>
                            {terms.providerPlural}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-tight">
                            Calendar sync, shifts & slot limits.
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">{terms.customersNavIcon}</span>
                            {terms.customerPlural} Portal
                          </span>
                          <span className="text-[10px] text-slate-500 leading-tight">
                            Self-scheduling & appointment logs.
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                            <span className="material-symbols-outlined text-[13px] text-blue-600">{terms.servicesNavIcon}</span>
                            {terms.servicePlural}
                          </span>
                          <span className="text-[10px] text-slate-500 leading-tight">
                            Catalog, duration & fee settings.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Receipt Breakdown */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Financial Settlement
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {purchaseResult.status || 'Paid'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 text-[11px]">Plan Tier:</span>
                        <span className="font-bold text-slate-900 text-xs">{purchaseResult.planTier} Plan ({billingCycle})</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 text-[11px]">Payment Gateway:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
                          <span className="material-symbols-outlined text-[14px] text-secondary">payments</span>
                          {purchaseResult.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 bg-white px-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <span className="text-slate-600 font-medium text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-primary">receipt_long</span>
                          Transaction ID (Gateway):
                        </span>
                        <span className="font-mono text-primary font-bold text-xs bg-primary/5 px-2 py-0.5 rounded border border-primary/20 select-all">
                          {purchaseResult.transactionId || purchaseResult.orderNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-slate-200 pt-1.5">
                        <span className="text-slate-700 font-bold text-xs">Total Settled:</span>
                        <span className="font-black text-emerald-700 text-sm">
                          Rs. {purchaseResult.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Verification Notice */}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <span className="material-symbols-outlined text-[17px] text-amber-600 shrink-0 mt-0.5">pending_actions</span>
                      <div className="leading-relaxed text-[11px]">
                        <strong className="block font-bold text-amber-950 mb-0.5">Pending Super Admin Review</strong>
                        Your subscription request and transaction details are logged. Super Admin is auditing your organization registration. Your workspace invitation link will be dispatched to <strong>{purchaseResult.adminEmail || form.adminEmail}</strong>.
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-1">
                      <button
                        onClick={handleDownloadCustomerInvoice}
                        className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                        <span>Download Official Invoice PDF</span>
                      </button>
                      <button
                        onClick={closeCheckout}
                        className="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PricingPage;
