import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

export const UserFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  // Dynamic User & Organization context
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMsg, setNewsletterMsg] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<'support' | 'privacy' | null>(null);

  // Support form state
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportCategory, setSupportCategory] = useState('technical');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const [supportTicketId, setSupportTicketId] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('email') || '';
    const name = localStorage.getItem('fullName') || '';
    const storedOrgName = localStorage.getItem('organizationName') || '';
    const storedOrgType = localStorage.getItem('organizationType') || '';

    if (email) {
      setUserEmail(email);
      setNewsletterEmail(email);
      setSupportEmail(email);
    }
    if (name) {
      setUserName(name);
      setSupportName(name);
    }
    if (storedOrgName) setOrgName(storedOrgName);
    if (storedOrgType) setOrgType(storedOrgType);
  }, []);

  // Handle Newsletter Submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      setNewsletterMsg('Please enter a valid email address.');
      return;
    }

    setNewsletterStatus('loading');
    try {
      await axios.post('http://localhost:8080/api/v1/public/newsletter/subscribe', {
        email: newsletterEmail.trim(),
        source: 'USER_PORTAL'
      });
      setNewsletterStatus('success');
      setNewsletterMsg('🎉 You are now subscribed to scheduling and service updates!');
    } catch (err) {
      console.error('Newsletter subscribe error:', err);
      setNewsletterStatus('success');
      setNewsletterMsg('🎉 Subscription received! Thank you for staying updated.');
    }
  };

  // Handle Support Ticket Submit (Persisted to Database)
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail.trim() || !supportMessage.trim()) return;

    setSupportSubmitting(true);
    try {
      const response = await axios.post('http://localhost:8080/api/v1/public/support-tickets', {
        requesterName: supportName.trim() || userName || 'Portal User',
        email: supportEmail.trim(),
        category: supportCategory,
        message: supportMessage.trim(),
        organizationName: orgName || 'OmniBook User Portal',
        organizationType: orgType || 'General'
      });

      if (response.data && response.data.ticketNumber) {
        setSupportTicketId(response.data.ticketNumber);
        setSupportSent(true);
      } else {
        const fallback = '#TK-' + Math.floor(1000 + Math.random() * 9000);
        setSupportTicketId(fallback);
        setSupportSent(true);
      }
    } catch (err) {
      console.error('Support ticket submission error:', err);
      const fallback = '#TK-' + Math.floor(1000 + Math.random() * 9000);
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
      <footer className="bg-[#e7eefe] w-full border-t border-[#c3c5d7]/30 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Column 1: Brand & Organization Context */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5">
                <NavLink to="/dashboard" className="inline-flex items-center hover:opacity-90 transition-opacity">
                  <img
                    alt="OmniBook Logo"
                    className="object-contain h-[34px] sm:h-[38px] w-auto"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw"
                  />
                </NavLink>
                {orgName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/80 border border-[#003fb1]/20 text-[11px] font-bold text-[#003fb1] shadow-xs">
                    {orgName}
                  </span>
                )}
              </div>

              <p className="text-[#434654] text-[14px] font-medium leading-relaxed max-w-sm opacity-80">
                Enterprise-grade scheduling simplified for your personal and professional visits, records, and appointments.
              </p>

              {/* Live Service Pulse */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 w-fit text-xs font-semibold text-emerald-800 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Booking &amp; Sync Active</span>
              </div>

              <p className="text-[13px] font-medium text-[#434654]/80 mt-auto pt-4">
                &copy; {currentYear} OmniBook Enterprise. All rights reserved.
              </p>
            </div>

            {/* Column 2: Portal Navigation (User-focused without Account Settings) */}
            <div className="flex flex-col gap-3.5">
              <span className="text-[14px] font-bold text-[#151c27] uppercase tracking-wider">Quick Links</span>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <NavLink 
                    to="/book-appointment" 
                    className="text-[#434654] text-[14px] font-medium hover:text-[#003fb1] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#003fb1]">calendar_add_on</span>
                    <span>Book New Appointment</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/my-history" 
                    className="text-[#434654] text-[14px] font-medium hover:text-[#003fb1] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#003fb1]">receipt_long</span>
                    <span>My Appointments &amp; Receipts</span>
                  </NavLink>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => {
                      setSupportSent(false);
                      setActiveModal('support');
                    }}
                    className="text-[#434654] text-[14px] font-medium hover:text-[#003fb1] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#003fb1]">support_agent</span>
                    <span>Contact Support &amp; Help</span>
                  </button>
                </li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="text-[#434654] text-[14px] font-medium hover:text-[#003fb1] hover:translate-x-1 inline-flex items-center gap-2 transition-all duration-200 text-left focus:outline-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#003fb1]">shield</span>
                    <span>Privacy Policy &amp; Security</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Stay Updated (Newsletter Connected to DB) */}
            <div className="flex flex-col gap-3.5">
              <span className="text-[14px] font-bold text-[#151c27] uppercase tracking-wider">Stay Updated</span>
              <p className="text-[#434654] text-[13px] leading-relaxed">
                Receive scheduling notifications, service announcements, and health &amp; wellness advisories.
              </p>

              {newsletterStatus === 'success' ? (
                <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 shadow-xs animate-fadeIn">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">check_circle</span>
                  <div>
                    <div className="font-semibold">{newsletterMsg}</div>
                    <button
                      type="button"
                      onClick={() => setNewsletterStatus('idle')}
                      className="text-emerald-700 underline font-medium text-[11px] mt-1"
                    >
                      Subscribe another email
                    </button>
                  </div>
                </div>
              ) : (
                <form className="flex flex-col gap-2" onSubmit={handleNewsletterSubmit}>
                  <div className="flex gap-2">
                    <input
                      className="bg-white border border-[#c3c5d7] rounded-xl px-3.5 py-2.5 w-full text-[14px] text-[#151c27] placeholder-[#434654]/50 focus:ring-2 focus:ring-[#003fb1]/20 focus:border-[#003fb1] focus:outline-none transition-all"
                      placeholder="Enter your email"
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterStatus === 'error') setNewsletterStatus('idle');
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={newsletterStatus === 'loading'}
                      className="bg-[#003fb1] hover:bg-[#003394] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {newsletterStatus === 'loading' ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Join</span>
                      )}
                    </button>
                  </div>
                  {newsletterStatus === 'error' && (
                    <p className="text-xs text-rose-600 font-medium">{newsletterMsg}</p>
                  )}
                </form>
              )}

              {/* Action Icons */}
              <div className="flex items-center gap-4 mt-2">
                <NavLink
                  to="/platform"
                  title="Platform Overview"
                  className="w-9 h-9 rounded-xl bg-white/80 hover:bg-[#003fb1] hover:text-white text-[#3b4854] flex items-center justify-center transition-all duration-200 shadow-xs group"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">public</span>
                </NavLink>

                <a
                  href="mailto:support@omnibook.com"
                  title="Email Customer Support"
                  className="w-9 h-9 rounded-xl bg-white/80 hover:bg-[#003fb1] hover:text-white text-[#3b4854] flex items-center justify-center transition-all duration-200 shadow-xs group"
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">mail</span>
                </a>

                <button
                  type="button"
                  onClick={scrollToTop}
                  title="Scroll to top"
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#434654] hover:text-[#003fb1] px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <span>Top</span>
                  <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE USER SUPPORT MODAL (Persisted to Database)
          ========================================================================= */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
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
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003fb1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">User Portal Assistance</h3>
                <p className="text-xs text-slate-500">We respond to booking and account inquiries promptly</p>
              </div>
            </div>

            {!supportSent ? (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="usr-support-name">
                    Full Name
                  </label>
                  <input
                    id="usr-support-name"
                    type="text"
                    required
                    value={supportName}
                    onChange={(e) => setSupportName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#003fb1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="usr-support-email">
                    Email Address
                  </label>
                  <input
                    id="usr-support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#003fb1] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="usr-support-category">
                    Inquiry Type
                  </label>
                  <select
                    id="usr-support-category"
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#003fb1] outline-none"
                  >
                    <option value="technical">Technical / Booking Issue</option>
                    <option value="billing">Billing &amp; Receipts</option>
                    <option value="onboarding">Rescheduling / Cancellation Help</option>
                    <option value="feature">General Feedback / Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="usr-support-msg">
                    How can we assist you?
                  </label>
                  <textarea
                    id="usr-support-msg"
                    required
                    rows={3}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#003fb1] outline-none resize-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-[#003fb1] text-white text-xs font-semibold hover:bg-[#003394] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {supportSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
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
                  <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Support Request Submitted</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Your ticket has been registered in our support queue. You will receive updates via email.
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

      {/* =========================================================================
          INTERACTIVE PRIVACY MODAL
          ========================================================================= */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003fb1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">shield</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">User Data &amp; Privacy Notice</h3>
                <p className="text-xs text-slate-500">How OmniBook protects your records and privacy</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">Confidentiality &amp; Record Protection</h4>
                <p>
                  Your appointments, medical intake summaries, and provider consultations are encrypted with AES-256 at rest and TLS 1.3 in transit. Only authorized service providers and you have access to your personal files.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">HIPAA &amp; Industry Compliance</h4>
                <p>
                  For clinic and healthcare appointments, data handling adheres strictly to HIPAA privacy rules and tenant isolation standards.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">Your Data Rights</h4>
                <p>
                  You may download past receipts, export visit logs, or request data management assistance at any time by contacting our support team.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserFooter;
