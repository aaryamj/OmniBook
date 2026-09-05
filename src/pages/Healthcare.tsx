import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const telehealthFeatures = [
  "One-click Zoom and Google Meet integration",
  "Automated appointment reminders"
];

const securityFeatures = [
  { icon: "verified_user", title: "HIPAA Compliant" },
  { icon: "lock", title: "Encrypted Storage" }
];



const footerLinks = [
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Status", "Contact Support"]
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"]
  }
];

const tonalCardClass = "bg-white shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5 hover:shadow-[0_10px_30px_rgba(26,86,219,0.1)] hover:-translate-y-0.5 transition-all duration-300 ease-out";

const Healthcare: React.FC = () => {
  return (
    <div className="bg-surface text-on-surface font-sans text-base selection:bg-primary-fixed selection:text-on-primary-fixed overflow-x-hidden">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="bg-primary pt-16 sm:pt-24 pb-24 sm:pb-32 flex flex-col justify-center items-center relative overflow-hidden px-4 sm:px-6 md:px-10 lg:px-margin-desktop transition-all duration-700 ease-out"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0 100%)' }}
        >
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-white text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-tight">
                Streamline Patient Care<br />
                with Intelligent<br />
                Scheduling.
              </h1>
              <p className="text-white/90 text-lg max-w-xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed">
                OmniBook Enterprise delivers high-performance clinic<br className="hidden lg:block" />
                management solutions, reducing administrative friction and<br className="hidden lg:block" />
                elevating the patient experience through AI-driven coordination.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="bg-tertiary text-on-tertiary px-8 py-3.5 rounded-xl text-base font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                  Register Your Clinic Today
                </button>
                <button className="border border-white/40 text-white px-8 py-3.5 rounded-xl text-base font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">play_circle</span> Watch Demo
                </button>
              </div>
            </div>
            <div className="relative flex justify-end items-center">
              <img 
                alt="Device Mockup Dashboard" 
                className="relative z-10 w-full max-w-[560px] rounded-[16px] shadow-2xl object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyX2Vt9ksfAuI4XBwKInGLS18m8JmgX7uOmO6Dce4Ohynw6_Lt_3px3bjYLld0lrjgQXEkC03aOUli0uFqE6sok0ZBpSwcAF5JdUuwL-Y-5q4AVDilO1WK6wt3EZ1i0eofuwWveTnzwnRoXRSSFRHM6BApBMD8BvkZ5ornQT0w30OHPaJ1VtWEKtLQIA6t28DXV6i7cuGrw8AhgJk2C56ODQlsdWR2hpByBL7cjNPMLr1izH75sZ9G2tGYh10Qe0BBoGOdbZSnnDE" 
              />
            </div>
          </div>
        </section>

        {/* Zig-Zag Sections */}
        <section className="py-12 sm:py-24 px-4 sm:px-6 md:px-10 lg:px-margin-desktop space-y-16 sm:space-y-24 max-w-7xl mx-auto transition-all duration-700 ease-out">
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center text-primary font-bold text-sm uppercase tracking-widest">
                <div className="w-6 h-[2px] bg-primary mr-3"></div>
                Telehealth Ready
              </div>
              <h2 className="text-[32px] font-bold text-on-background leading-tight">Virtual Consultations Made Easy</h2>
              <p className="text-base text-secondary leading-relaxed">
                Our integrated telehealth module allows physicians to launch<br className="hidden lg:block" />
                secure, high-definition video calls directly from the patient record.<br className="hidden lg:block" />
                Simplify the patient journey from booking to digital waiting rooms.
              </p>
              <ul className="space-y-3 pt-2">
                {telehealthFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-base text-secondary">
                    <span className="material-symbols-outlined text-[#10B981] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                alt="Virtual Consultations Mockup" 
                className="w-full max-w-[500px] rounded-[12px] p-2 bg-white shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqDV2F-pW6ICtadksJqBMsAp8NHb7RQI_gLx2NNQICnnySEHqBF9cAcaefn-0yi2HEnkO_d3gPSmm0bxqpkE70KsAZ68nHxoDXajSewHLIwA1d0eKzWOvVjuvIL6a7EP8zTX09cDzuNsLQp4Jv-VmyFCsOcE3sSyA1AiWiyE0EZ3ShbfaULWj-PRkB_2kjHZg0LrkqZa69ol1kXrJ6yR0yljv69xt9Kwu6YhaduMeXbv_qFQm7vaiLucJ-jnaSkL1hAINEw7RkuxE" 
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
              <img 
                alt="Security and RBAC Mockup" 
                className="w-full max-w-[500px] rounded-[12px] p-2 bg-white shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAX9SW8gh3AA3_QlcHJtoHO4SwVOxyBuXOM4z1M7SVV6yHrb4EtUZpXbTWJmUvuJBh0TTJT3E5Co2zGy8kxcAPJC-D9Yvfkso1UI3nh2SO2vbLq_UP4qIoBiFkuOISOPr__bVsTVWTEw6-GOZ7ryEsuQmXCn2z7gO0dxQrSbqKTx8xetY_YzzvCfy28HvqX5NjH_9DAg8gmtYfUR7Hb87QINpJZeQsp5vrhaG4XDSr9tvSreB_vWNsfAXJMeXs623b6FQEOEsH103A" 
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center text-primary font-bold text-sm uppercase tracking-widest">
                <div className="w-6 h-[2px] bg-primary mr-3"></div>
                Enterprise Security
              </div>
              <h2 className="text-[32px] font-bold text-on-background leading-tight">
                Protect Patient Data with Role-Based<br className="hidden lg:block"/>
                Security
              </h2>
              <p className="text-base text-secondary leading-relaxed">
                Built on Spring Security RBAC, OmniBook ensures that sensitive<br className="hidden lg:block"/>
                medical data is only accessible to authorized personnel. Implement<br className="hidden lg:block"/>
                granular controls for nurses, doctors, and administrative staff.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                {securityFeatures.map((feature, idx) => (
                  <div key={idx} className="p-5 rounded-[12px] bg-[#f0f3ff] flex flex-col gap-6 items-start">
                    <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{feature.icon}</span>
                    <div className="text-sm font-bold text-on-background">{feature.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Smart Scheduling Showcase */}
        <section className="bg-[#E1EFFE] py-12 sm:py-24 px-4 sm:px-6 md:px-10 lg:px-margin-desktop transition-all duration-700 ease-out">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-[32px] font-bold text-primary">Smart Scheduling Innovation</h2>
              <p className="text-base text-secondary max-w-2xl mx-auto leading-relaxed">
                Leverage predictive algorithms to optimize clinic flow and maximize provider<br className="hidden md:block"/>
                availability.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-[#E1EFFE] flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[20px]">event_available</span>
                </div>
                <h3 className="text-lg font-bold text-on-background mb-3 leading-tight">
                  Smart Time Slot<br className="hidden lg:block"/> Recommendations
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Our AI analyzes historical patient check-in<br className="hidden lg:block"/>
                  times and procedure durations to suggest<br className="hidden lg:block"/>
                  optimal scheduling slots for every doctor.
                </p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-[#E1EFFE] flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                </div>
                <h3 className="text-lg font-bold text-on-background mb-3 leading-tight">
                  No-Show Prediction
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Identify high-risk appointments and<br className="hidden lg:block"/>
                  automatically trigger extra confirmation<br className="hidden lg:block"/>
                  prompts to reduce costly idle time.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-[12px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5 flex flex-col items-start text-left">
                <div className="w-10 h-10 rounded-full bg-[#E1EFFE] flex items-center justify-center text-primary mb-4">
                  <span className="material-symbols-outlined text-[20px]">dynamic_feed</span>
                </div>
                <h3 className="text-lg font-bold text-on-background mb-3 leading-tight">
                  Dynamic Queue Management
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Real-time adjustments to patient wait times<br className="hidden lg:block"/>
                  communicated directly to mobile devices<br className="hidden lg:block"/>
                  for a stress-free lobby experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Highlight */}
        <section className="py-12 sm:py-24 px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-7xl mx-auto transition-all duration-700 ease-out">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-auto lg:h-[420px]">
            {/* Cell 1 */}
            <div className="lg:col-span-2 rounded-[12px] p-8 flex flex-col justify-between bg-white shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5">
              <div>
                <h3 className="text-[20px] font-bold text-on-background mb-2">Comprehensive Patient Records</h3>
                <p className="text-sm text-secondary mb-4">Unified view of history, vitals, and medication.</p>
                <button className="text-primary font-bold text-sm flex items-center gap-1 group">
                  Explore Module <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
              <div className="mt-8 bg-white rounded-[12px] p-6 border border-[#e2e8f8] shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-full bg-[#dce2f3]"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-24 bg-[#dce2f3] rounded-full"></div>
                    <div className="h-2 w-16 bg-[#f0f3ff] rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-1.5 w-full bg-[#f0f3ff] rounded-full"></div>
                  <div className="h-1.5 w-full bg-[#f0f3ff] rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-[#f0f3ff] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-6 h-full">
              {/* Cell 2 */}
              <div className="col-span-2 rounded-[12px] p-8 bg-[#f0f4ff]">
                <h3 className="text-lg font-bold text-primary mb-3">Revenue Cycle Management</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Automated billing, insurance verification, and claim tracking for<br className="hidden lg:block"/>
                  faster reimbursements.
                </p>
              </div>
              {/* Cell 3 */}
              <div className="col-span-1 rounded-[12px] p-6 flex flex-col items-center justify-center text-center bg-white shadow-[0_4px_20px_rgba(26,86,219,0.05)] border border-black/5">
                <span className="material-symbols-outlined text-[28px] text-[#005438] mb-3" style={{ fontVariationSettings: "'FILL' 0" }}>insert_chart</span>
                <div className="text-[24px] font-bold text-on-background">15%</div>
                <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mt-1">Wait reduction</div>
              </div>
              {/* Cell 4 */}
              <div className="col-span-1 rounded-[12px] p-6 flex flex-col items-center justify-center text-center bg-primary shadow-[0_4px_20px_rgba(26,86,219,0.05)]">
                <span className="material-symbols-outlined text-[28px] text-white mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                <div className="text-[24px] font-bold text-white">500+</div>
                <div className="text-[11px] font-bold text-white uppercase tracking-wider mt-1">Clinics Served</div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Banner */}
        <section className="bg-primary px-4 sm:px-6 md:px-10 lg:px-margin-desktop py-12 sm:py-16 transition-all duration-700 ease-out">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-lg text-center lg:text-left">
              <h2 className="text-[24px] font-bold mb-2">Stay updated with healthcare insights.</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                Join 10,000+ medical professionals getting the latest on<br className="hidden lg:block"/>
                clinic tech.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <input 
                className="flex-1 lg:w-[320px] bg-white rounded-[8px] border-none px-4 py-3 text-sm text-on-background focus:ring-2 focus:ring-white outline-none" 
                placeholder="Email address" 
                type="email" 
              />
              <button className="bg-tertiary text-on-tertiary px-6 py-3 rounded-[8px] text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-md">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Healthcare;
