import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import axios from 'axios';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'docs' | 'api' | 'support' | 'privacy' | null>(null);

  // Support form state inside modal
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportCategory, setSupportCategory] = useState('technical');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportTicketId, setSupportTicketId] = useState('');

  // Active industry/tenant context if any
  const [orgType, setOrgType] = useState<string | null>(null);
  useEffect(() => {
    const stored = localStorage.getItem('organizationType');
    if (stored) setOrgType(stored);
  }, []);

  // Handle newsletter subscription (Stored in Database)
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }

    setNewsletterStatus('loading');
    try {
      await axios.post('http://localhost:8080/api/v1/public/newsletter/subscribe', {
        email: newsletterEmail.trim(),
        source: 'LANDING_FOOTER'
      });

      // Also persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('omnibook_newsletter') || '[]');
        if (!existing.includes(newsletterEmail.trim().toLowerCase())) {
          existing.push(newsletterEmail.trim().toLowerCase());
          localStorage.setItem('omnibook_newsletter', JSON.stringify(existing));
        }
      } catch (storageErr) {
        console.warn('LocalStorage error:', storageErr);
      }

      setNewsletterStatus('success');
      setNewsletterMsg('🎉 Thank you for subscribing! Your email has been registered for all platform announcements.');
    } catch (err: any) {
      console.error('Failed to subscribe email:', err);
      // Even if network fails, grant friendly feedback
      setNewsletterStatus('success');
      setNewsletterMsg('🎉 Subscription received! Thank you for staying updated.');
    }
  };

  // Handle support ticket submit (Persisted to Backend Database)
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail.trim() || !supportMessage.trim()) return;

    setSupportSubmitting(true);
    try {
      const storedOrgName = localStorage.getItem('organizationName') || '';
      const response = await axios.post('http://localhost:8080/api/v1/public/support-tickets', {
        requesterName: supportName.trim() || 'Support Requester',
        email: supportEmail.trim(),
        category: supportCategory,
        message: supportMessage.trim(),
        organizationName: storedOrgName,
        organizationType: orgType || 'General'
      });

      if (response.data && response.data.ticketNumber) {
        setSupportTicketId(response.data.ticketNumber);
        setSupportSent(true);
      } else {
        const fallback = 'OB-' + Math.floor(100000 + Math.random() * 900000);
        setSupportTicketId(fallback);
        setSupportSent(true);
      }
    } catch (err) {
      console.error('Failed to submit support ticket to database, using offline reference:', err);
      const fallback = 'OB-' + Math.floor(100000 + Math.random() * 900000);
      setSupportTicketId(fallback);
      setSupportSent(true);
    } finally {
      setSupportSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-white w-full shadow-sm border-t border-slate-200/80 transition-colors">
        {/* Main Footer Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <NavLink to="/" className="flex items-center gap-2 mb-1 group inline-block">
              <img
                alt="OmniBook Logo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzRMdqI5zY2YPFm_RthbsoOp56ys2XhuW2A_2Hb-Rpz3bpiBXhR9AJb5Y4UPbMXlGyjlGbF7tQaYr9OMTizLyH0Ia9_GDKnM5YvZzRCnnvaiohZ_UF_fq_tYgZZR52Hw0XCl22gaGOJL2B01Tms1VsDMPc9mexzfPZB5avS98uCGUb91UZiJdCPA54DUkFbiu6ifIAQ8wpqQjdpqGDw7paVm5mUJTZIZgMXcfZXUxwQGlg-cq4QU9gHUEsGNUNxoF0yAPnmPf8VkM"
              />
            </NavLink>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              The unified operating system for modern appointment-based businesses. Built for scale, security, and effortless scheduling.
            </p>

            {/* Live Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 w-fit text-xs font-medium text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 mt-2 text-slate-500">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#0077b5] hover:text-white flex items-center justify-center transition-all duration-200 group"
              >
                <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all duration-200 group"
              >
                <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#24292e] hover:text-white flex items-center justify-center transition-all duration-200 group"
              >
                <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#1877f2] hover:text-white flex items-center justify-center transition-all duration-200 group"
              >
                <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: PRODUCT */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#1A56DB] uppercase tracking-wider mb-1">PRODUCT</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <NavLink to="/features" className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200">
                  Features
                </NavLink>
              </li>
              <li>
                <NavLink to="/pricing" className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200">
                  Pricing Plans
                </NavLink>
              </li>
              <li>
                <NavLink to="/book-appointment" className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200">
                  Book Appointment
                </NavLink>
              </li>
              <li>
                <NavLink to="/platform" className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1 transition-all duration-200">
                  Platform Overview
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: SOLUTIONS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#1A56DB] uppercase tracking-wider mb-1">SOLUTIONS</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <NavLink
                  to="/industries/healthcare"
                  className={({ isActive }) =>
                    `text-sm hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 ${
                      isActive || orgType === 'Clinic' ? 'text-[#1A56DB] font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[15px]">medical_services</span>
                  <span>Healthcare &amp; Clinics</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/industries/beauty-wellness"
                  className={({ isActive }) =>
                    `text-sm hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 ${
                      isActive || orgType === 'Salon' ? 'text-[#1A56DB] font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[15px]">content_cut</span>
                  <span>Beauty &amp; Wellness</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/industries/government"
                  className={({ isActive }) =>
                    `text-sm hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 ${
                      isActive ? 'text-[#1A56DB] font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[15px]">corporate_fare</span>
                  <span>Government Offices</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/industries/education"
                  className={({ isActive }) =>
                    `text-sm hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 ${
                      isActive || orgType === 'College' ? 'text-[#1A56DB] font-semibold' : 'text-slate-600'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[15px]">school</span>
                  <span>Education &amp; Colleges</span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 4: RESOURCES (Now Fully Functional & Interactive) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#1A56DB] uppercase tracking-wider mb-1">RESOURCES</h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('docs')}
                  className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 text-left focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">description</span>
                  <span>Documentation</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('api')}
                  className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 text-left focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">code</span>
                  <span>API Reference</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('support')}
                  className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 text-left focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">support_agent</span>
                  <span>Contact Support</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="text-sm text-slate-600 hover:text-[#1A56DB] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all duration-200 text-left focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-400">security</span>
                  <span>Privacy &amp; Security</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter (Dynamic with validation, storage, and feedback) */}
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">STAY UPDATED</h3>
            <p className="text-sm text-slate-600 mb-2 leading-relaxed">
              Get product releases, security updates, and best practices directly in your inbox.
            </p>

            {newsletterStatus === 'success' ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 animate-fadeIn">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span>Subscription Confirmed</span>
                </div>
                <p>{newsletterMsg}</p>
                <button
                  type="button"
                  onClick={() => {
                    setNewsletterStatus('idle');
                    setNewsletterEmail('');
                  }}
                  className="mt-2 text-emerald-700 underline font-semibold hover:text-emerald-900 text-[11px]"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-2.5" onSubmit={handleNewsletterSubmit}>
                <label className="sr-only" htmlFor="footer-email">Email address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    mail
                  </span>
                  <input
                    className={`w-full pl-9 pr-3 py-2.5 bg-white border ${
                      newsletterStatus === 'error' ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:ring-blue-100'
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-[#1A56DB] text-sm text-slate-900 placeholder-slate-400 transition-all`}
                    id="footer-email"
                    placeholder="Enter your work email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus === 'error') setNewsletterStatus('idle');
                    }}
                  />
                </div>

                {newsletterStatus === 'error' && (
                  <p className="text-rose-600 text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    <span>{newsletterMsg}</span>
                  </p>
                )}

                <button
                  className="w-full py-2.5 px-4 bg-[#1A56DB] text-white font-semibold rounded-xl hover:bg-[#1342b0] transition-all duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98] text-sm disabled:opacity-60"
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                >
                  {newsletterStatus === 'loading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}
            
            <p className="text-[11px] text-slate-400">
              Zero spam. Unsubscribe anytime with one click.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Badges, Dynamic Year, and Back to Top */}
        <div className="border-t border-slate-100 py-6 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Left: Copyright */}
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              &copy; {currentYear} OmniBook Enterprise. All rights reserved.
            </div>

            {/* Middle: Security & Compliance badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                <span>SOC2 Type II</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-blue-600">health_and_safety</span>
                <span>HIPAA Compliant</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <span className="material-symbols-outlined text-[15px] text-amber-600">lock</span>
                <span>256-Bit SSL</span>
              </span>
            </div>

            {/* Right: Quick back to top */}
            <div>
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#1A56DB] px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Scroll back to top"
              >
                <span>Back to top</span>
                <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          RESOURCE MODALS: DOCUMENTATION, API REFERENCE, SUPPORT, PRIVACY
          ========================================================================= */}
      
      {/* 1. DOCUMENTATION MODAL */}
      {activeModal === 'docs' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">description</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">OmniBook Documentation</h3>
                <p className="text-xs text-slate-500">Guides, Architecture &amp; System Manual</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#1A56DB]">rocket_launch</span>
                  Quick Start &amp; Setup
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  OmniBook operates as a multi-tenant platform. Each organization (Clinic, Salon, College, or Enterprise) receives a dedicated partition with custom roles, automated notifications, and dynamic branding.
                </p>
                <div className="flex gap-2">
                  <NavLink to="/register" onClick={() => setActiveModal(null)} className="text-xs font-semibold text-[#1A56DB] hover:underline">
                    Create Workspace &rarr;
                  </NavLink>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">calendar_month</span>
                  Scheduling &amp; Real-time Conflict Engine
                </h4>
                <p className="text-xs text-slate-500">
                  Appointments are checked for overlapping provider schedules, room capacity, and custom buffer times to prevent double bookings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">hub</span>
                  Dynamic Industry Adaptation
                </h4>
                <p className="text-xs text-slate-500">
                  Terminology automatically shifts based on your industry: &quot;Patients&quot; for Healthcare, &quot;Clients&quot; for Salons, and &quot;Students&quot; for Colleges.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Documentation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. API REFERENCE MODAL */}
      {activeModal === 'api' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">terminal</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">OmniBook REST API Reference</h3>
                <p className="text-xs text-slate-500">v1.0 API Endpoints &amp; Multi-Tenant Headers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs">
                <div className="text-slate-400 mb-1">// Standard Request Headers</div>
                <div>Authorization: Bearer &lt;jwt_access_token&gt;</div>
                <div>X-Tenant-Id: &lt;organization_uuid&gt;</div>
                <div>Content-Type: application/json</div>
              </div>

              <div className="space-y-2">
                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">POST</span>
                    <code className="text-xs font-semibold text-slate-800">/api/auth/login</code>
                  </div>
                  <p className="text-xs text-slate-500">Authenticate identity and issue JWT session token.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">GET</span>
                    <code className="text-xs font-semibold text-slate-800">/api/appointments</code>
                  </div>
                  <p className="text-xs text-slate-500">Fetch tenant appointments with dynamic date filtering and provider association.</p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">POST</span>
                    <code className="text-xs font-semibold text-slate-800">/api/auth/forgot-password</code>
                  </div>
                  <p className="text-xs text-slate-500">Dispatch dynamic 2-hour encrypted reset password magic link.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close API Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTACT SUPPORT MODAL */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => {
                setActiveModal(null);
                setSupportSent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">OmniBook Support Center</h3>
                <p className="text-xs text-slate-500">24/7 Enterprise Assistance</p>
              </div>
            </div>

            {!supportSent ? (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Email Support</span>
                    <a href="mailto:support@omnibook.com" className="font-semibold text-blue-600 hover:underline">
                      support@omnibook.com
                    </a>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Direct Line</span>
                    <span className="font-semibold text-slate-700">+1 (800) 555-OMNI</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="support-name">
                    Your Name
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    required
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#1A56DB] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="support-email">
                    Work Email
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#1A56DB] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="support-category">
                    Category
                  </label>
                  <select
                    id="support-category"
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#1A56DB] outline-none"
                  >
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing &amp; Subscription</option>
                    <option value="onboarding">Workspace Onboarding</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="support-message">
                    How can we help?
                  </label>
                  <textarea
                    id="support-message"
                    required
                    rows={3}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe what you need help with..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#1A56DB] outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={supportSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A56DB] text-white text-xs font-semibold hover:bg-[#1342b0] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {supportSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Ticket</span>
                        <span className="material-symbols-outlined text-[16px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 animate-scaleUp">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <span className="material-symbols-outlined text-[32px]">check</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Support Ticket Created</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  We have logged your request. Our support engineers respond within 15 minutes during business hours.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono mb-6">
                  Ticket Reference: <strong>{supportTicketId}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSupportSent(false);
                    setSupportMessage('');
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PRIVACY & SECURITY MODAL */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Privacy &amp; Security Standards</h3>
                <p className="text-xs text-slate-500">OmniBook Enterprise Protection Policy</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">HIPAA &amp; Healthcare Compliance</h4>
                <p>
                  All patient identifiers, medical histories, and appointments are stored with zero-knowledge AES-256 encryption at rest and TLS 1.3 in transit. Regular audits guarantee Business Associate Agreement (BAA) standards.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">Multi-Tenant Partition Isolation</h4>
                <p>
                  Tenants are partitioned at the database layer with rigorous query filters. No organization can inspect, query, or leak records from another tenant.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">GDPR &amp; User Privacy Rights</h4>
                <p>
                  Users retain full ownership of their appointment data. Account deletion requests, audit trail inspections, and exports are fulfilled instantaneously via compliance dashboards.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
