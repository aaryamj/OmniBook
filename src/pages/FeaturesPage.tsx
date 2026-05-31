import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FeaturesPage: React.FC = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] font-sans selection:bg-[#1a56db]/20 selection:text-[#1a56db] overflow-x-hidden">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 md:px-10 text-center bg-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-[40px] md:text-[56px] font-bold text-[#151c27] leading-[1.1] tracking-tight">
              Powerful features. <br className="hidden md:block" />
              <span className="text-[#1853d9]">Zero friction.</span>
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#434654] max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of enterprise scheduling. OmniBook combines AI intelligence with robust management tools to keep your business moving.
            </p>
          </div>
        </section>

        {/* Zig-Zag Feature Showcase */}
        <section className="py-16 px-4 md:px-10 space-y-16 bg-[#f9f9ff]">
          {/* Section 1 */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#e1e8ff] text-[#1853d9] px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span className="text-[12px] font-bold tracking-wider">AI POWERED</span>
              </div>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                AI Chatbot & Smart Slots
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Let our intelligent assistant handle the back-and-forth. Our AI analyzes multi-staff availability and client preferences to suggest the perfect "Smart Slot" instantly. No more calendar tetris; just seamless bookings that respect everyone's time.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Natural language booking for end-users</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Real-time availability conflict resolution</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#b5c4ff]/20 rounded-[24px] blur-3xl -z-10 transition-all group-hover:bg-[#b5c4ff]/30"></div>
              <img 
                alt="OmniBook Smart Slot interface" 
                className="rounded-[24px] shadow-xl border border-[#dce2f3] w-full object-cover aspect-[4/3] hover:-translate-y-1 transition-transform" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxEgsTSy2loCdYcQOQ6XGE5Y2FeBrHgxiF0WuqVE_6x-Jii3KE2Q-pZWrPtmNxSa90eGagA4Dp2R3Hcy6JmhrqkM82XZcCw5TdiZCUjk7v5PHGewsbjim8ypQDWyM7x2rGbt1j0Ljk8O5ETOae-uedQqfwfGKjTOBwxEv-oyb3_4cmGgqUb0B5PCcPSl5LRZmUNzXL7-XvEBIfnlMVyz8m-SrOB4GX-kT_qkhCf6AdjMMca56rSFUX_6z12BkWE3ELlwQlqeoDMsE" 
              />
            </div>
          </div>

          {/* Section 2 */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-[#6ffbbe]/20 rounded-[24px] blur-3xl -z-10 transition-all group-hover:bg-[#6ffbbe]/30"></div>
              <img 
                alt="Contactless Check-In UI" 
                className="rounded-[24px] shadow-xl border border-[#dce2f3] w-full object-cover aspect-[4/3] hover:-translate-y-1 transition-transform" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVHQIRRySfBWKmCtggsMoxI2bcO6ZlQ_eV_cdXm9C6onnkDj6l8e1H7XPflSmodnC-tEItROccW26sCtC2Hlm17KbnRIgo3BNkZwF_Yrk1yV5oBI4CI6RkPCAH3dIijJPSpyVeHq3awTcQmdpwT4YHYk910rB7ByD7dfn0flQE49GTMDOAQM4UDW8Vpmx-Vds0LNshLAKhEalOw1uVx-G8AvTVNy65OroqwmEhWEBxZ8nM8uI7CSSJwb7mssu1agKTN7x-vaUTVgI" 
              />
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#e6f4ea] text-[#006f4b] px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[18px]">distance</span>
                <span className="text-[12px] font-bold tracking-wider">HYBRID READY</span>
              </div>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                Contactless Check-In & Telemedicine
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Bridge the gap between physical and digital presence. Clients can check in via QR codes for in-person appointments or transition directly into integrated high-fidelity video consultations with a single tap.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Secure end-to-end encrypted video calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Automated patient arrival notifications</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bento Box Tech Grid */}
        <section className="py-16 px-4 md:px-10 bg-[#f0f3ff]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9]">Enterprise Infrastructure</h2>
              <p className="text-[16px] text-[#434654]">Built on a world-class technology stack for maximum reliability.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Real-Time */}
              <div className="p-8 rounded-[24px] bg-white border border-[#e2e8f0] flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-[12px] bg-[#eef2fa] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1853d9]">sync_alt</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#151c27] mb-2">Real-Time WebSockets</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">Instant updates across all devices without page refreshes.</p>
                </div>
              </div>
              
              {/* Payments */}
              <div className="p-8 rounded-[24px] bg-[#e2e8f8] border border-[#dce2f3] flex flex-col justify-between md:col-span-2 min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-[12px] bg-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1853d9]">payments</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#151c27] mb-2">eSewa/Khalti Payments</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">Localized payment gateways integrated directly into your checkout flow for high conversion rates.</p>
                </div>
              </div>
              
              {/* Notifications */}
              <div className="p-8 rounded-[24px] bg-white border border-[#e2e8f0] flex flex-col justify-between md:col-span-2 min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-[12px] bg-[#eef2fa] flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1853d9]">mail_outline</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#151c27] mb-2">SMS & Email Notifications</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">Reduce no-shows by up to 40% with automated multi-channel reminders and custom templates.</p>
                </div>
              </div>
              
              {/* Multi-Branch */}
              <div className="p-8 rounded-[24px] bg-[#e2e8f8] border border-[#dce2f3] flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-[12px] bg-white flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#1853d9]">account_tree</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#151c27] mb-2">Multi-Branch Routing</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">Scale effortlessly across infinite locations with centralized management.</p>
                </div>
              </div>
              
              {/* Security */}
              <div className="p-8 rounded-[24px] bg-white border border-[#e2e8f0] flex flex-col md:flex-row md:items-center gap-8 md:col-span-3 min-h-[160px] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-[16px] bg-[#006f4b] flex items-center justify-center shrink-0 shadow-lg shadow-[#006f4b]/20">
                  <span className="material-symbols-outlined text-white text-[32px]">security</span>
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-[#151c27] mb-2">Spring Security RBAC</h3>
                  <p className="text-[14px] text-[#434654] leading-relaxed">Fine-grained Role-Based Access Control ensuring your sensitive client data remains accessible only to authorized personnel.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Highlight */}
        <section className="bg-[#1853d9] text-white overflow-hidden relative">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <h2 className="text-[40px] md:text-[48px] font-bold leading-tight">Powerful Chart.js Analytics</h2>
              <p className="text-[18px] text-white/90 leading-relaxed max-w-lg">
                Turn data into decisions. Our high-fidelity dashboard provides real-time insights into revenue share, monthly active users, and staff performance metrics. Visualize trends before they happen.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[16px] border border-white/20 shadow-xl min-w-[140px]">
                  <p className="text-[32px] font-bold mb-1">24%</p>
                  <p className="text-[12px] uppercase tracking-wider text-white/80 font-bold">Growth MoM</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[16px] border border-white/20 shadow-xl min-w-[140px]">
                  <p className="text-[32px] font-bold mb-1">99.9%</p>
                  <p className="text-[12px] uppercase tracking-wider text-white/80 font-bold">Uptime SLA</p>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <img 
                alt="Data analytics charts" 
                className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-s6uyhbwKthK6XKt1GI2cK6h94gzwrDFG5lU6edfOORCYxQn6Ep1e2WjiuX0UEE7u98MubjsphULg8Ib5vcBoAS9wi8r8HsXu2nbPGYv16qH28mlLBD6Fi7EI8RxZeEYLJ_68RIdmvP-88NR0LrrcYIMWHFA8srGwXWN0W2ROh0r3QRv_MM9JlK5ZD_FypSeXwI9zG97YwwEhMOPCy9WETbL-c2co9WpPQS_R-no1ctgCIoPQRwfDnOnBNCLA3niT7Jhkmj40St8" 
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 px-4 md:px-10 text-center bg-[#f9f9ff]">
          <div className="max-w-4xl mx-auto space-y-10 bg-[#e2e8f8] p-12 md:p-16 rounded-[32px] shadow-sm">
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9]">
              Ready to transform your scheduling workflow?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-[#006f4b] hover:bg-[#005438] text-white px-8 py-4 rounded-[12px] font-bold text-[16px] shadow-lg shadow-[#006f4b]/20 transition-all hover:-translate-y-1">
                Experience OmniBook Now
              </button>
              <button className="bg-white text-[#1853d9] border border-[#dce2f3] px-8 py-4 rounded-[12px] font-bold text-[16px] hover:bg-[#f0f3ff] transition-all hover:-translate-y-1">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
