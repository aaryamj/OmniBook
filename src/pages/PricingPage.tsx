import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingPage: React.FC = () => {
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

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans selection:bg-[#1a56db]/20 selection:text-[#1a56db] overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-10 pt-16 md:pt-24 pb-16 mt-20">
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-[40px] md:text-[56px] font-bold text-[#1853d9] mb-6 max-w-3xl mx-auto leading-[1.1] tracking-tight">
            Simple, Transparent Pricing for Any Business Size
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#434654] max-w-2xl mx-auto leading-relaxed">
            From individual practitioners to global enterprises, OmniBook scales with your scheduling needs. No hidden fees, just pure efficiency.
          </p>
        </section>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          
          {/* Starter Plan */}
          <div className="pricing-card bg-white p-8 rounded-[16px] flex flex-col border border-[#e2e8f0] shadow-sm hover:shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#dce2f3]"></div>
            <div className="mb-8">
              <h3 className="text-[24px] font-bold text-[#151c27] mb-2">Starter</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-[#1853d9]">Rs. 2,000</span>
                <span className="text-[#53606c]">/mo</span>
              </div>
              <p className="text-[14px] text-[#53606c] mt-2">Perfect for solo providers getting started.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">3 Providers</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">1 Branch</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Classic Calendar</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Basic Email Alerts</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Standard Support</span>
              </li>
            </ul>
            <button className="w-full py-3 px-6 bg-[#006f4b] hover:bg-[#005438] text-white rounded-[12px] font-bold transition-all hover:-translate-y-1 shadow-md">
              Get Started
            </button>
          </div>

          {/* Professional Plan */}
          <div className="pricing-card bg-[#1853d9] p-8 rounded-[16px] flex flex-col border-none shadow-[0_20px_40px_rgba(24,83,217,0.2)] relative md:scale-105 z-10 text-white group">
            <div className="absolute top-4 right-4 bg-[#6ffbbe] text-[#002113] font-bold px-3 py-1 rounded-full text-[12px] uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div className="mb-8">
              <h3 className="text-[24px] font-bold text-white mb-2">Professional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-white">Rs. 5,000</span>
                <span className="text-white/80">/mo</span>
              </div>
              <p className="text-[14px] text-white/90 mt-2">Advanced tools for growing teams.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">15 Providers</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">Multi-branch Management</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">AI Scheduling Chatbot</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">WebSockets Real-time Sync</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">Automated SMS Alerts</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">Advanced Analytics Dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#6ffbbe]">check_circle</span>
                <span className="text-[16px] text-white">Priority 24/7 Support</span>
              </li>
            </ul>
            <button className="w-full py-4 px-6 bg-[#006f4b] hover:bg-[#005438] text-white rounded-[12px] font-bold transition-all shadow-lg hover:-translate-y-1">
              Choose Professional
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card bg-white p-8 rounded-[16px] flex flex-col border border-[#e2e8f0] shadow-sm hover:shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#1853d9]"></div>
            <div className="mb-8">
              <h3 className="text-[24px] font-bold text-[#151c27] mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-[#1853d9]">Custom</span>
              </div>
              <p className="text-[14px] text-[#53606c] mt-2">Tailored solutions for large scale.</p>
            </div>
            <ul className="flex-grow space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Unlimited Providers & Branches</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">QR Code Patient Check-In</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Integrated Telemedicine</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Dedicated Success Manager</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Full API Access & Webhooks</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006f4b]">check_circle</span>
                <span className="text-[16px] text-[#434654]">Custom SLA & Security Audit</span>
              </li>
            </ul>
            <button className="w-full py-3 px-6 bg-[#1853d9] hover:bg-[#1343b8] text-white rounded-[12px] font-bold transition-all shadow-md hover:-translate-y-1">
              Request a Demo
            </button>
          </div>

        </div>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#151c27] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-[#1853d9] mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">help</span>
                Can I change my plan later?
              </h4>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Absolutely. You can upgrade or downgrade your plan at any time from your dashboard settings. If you upgrade, the price change will be prorated for the remainder of the billing cycle.
              </p>
            </div>
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-[#1853d9] mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">security</span>
                Is my data secure?
              </h4>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Security is our top priority. We use industry-standard AES-256 encryption, HIPAA-compliant storage for medical data, and regular third-party security audits to ensure your information is safe.
              </p>
            </div>
            <div className="bg-[#f0f3ff] p-8 rounded-[16px] border border-[#e2e8f8]">
              <h4 className="text-[20px] font-bold text-[#1853d9] mb-3 flex items-center gap-3">
                <span className="material-symbols-outlined">integration_instructions</span>
                Does OmniBook integrate with other apps?
              </h4>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Yes, Professional and Enterprise plans include native integrations with Google Calendar, Zoom, Stripe, and Zapier. Our Enterprise plan also offers a robust API for custom integrations.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="text-center py-12 bg-[#f0f3ff] rounded-[24px]">
          <h5 className="text-[14px] uppercase tracking-widest text-[#53606c] font-bold mb-8">
            Trusted by 2,000+ businesses worldwide
          </h5>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50">
            <span className="text-[24px] font-black tracking-tighter">HEALTHCO</span>
            <span className="text-[24px] font-black tracking-tighter">MEDILINK</span>
            <span className="text-[24px] font-black tracking-tighter">CARE+</span>
            <span className="text-[24px] font-black tracking-tighter">VITA</span>
            <span className="text-[24px] font-black tracking-tighter">CLINIX</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
