import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const pillars = [
  {
    role: "For Customers",
    title: "\"Frictionless Booking\"",
    icon: "person_search",
    iconBg: "bg-[#1853d9]",
    cardBg: "bg-white",
    border: "border border-[#e2e8f0]",
    features: [
      { icon: "chat_bubble", text: "24/7 AI Smart Chatbot", bg: "bg-[#f8f9fc]" },
      { icon: "qr_code_scanner", text: "Instant QR Check-in", bg: "bg-[#f8f9fc]" }
    ]
  },
  {
    role: "For Providers",
    title: "\"Real-Time Management\"",
    icon: "co_present",
    iconBg: "bg-[#104bb5]",
    cardBg: "bg-[#eef2fa]",
    border: "border border-transparent",
    features: [
      { icon: "sync", text: "Live WebSocket Sync", bg: "bg-white" },
      { icon: "video_chat", text: "Direct Telemedicine Links", bg: "bg-white" }
    ]
  },
  {
    role: "For Admins",
    title: "\"Total Control\"",
    icon: "admin_panel_settings",
    iconBg: "bg-[#1853d9]",
    cardBg: "bg-white",
    border: "border border-[#e2e8f0]",
    features: [
      { icon: "dashboard", text: "Global Analytics Dashboard", bg: "bg-[#f8f9fc]" },
      { icon: "account_tree", text: "Multi-Branch Routing", bg: "bg-[#f8f9fc]" }
    ]
  }
];

const integrations = [
  { type: "text", content: "eSewa" },
  { type: "text", content: "Khalti" },
  { type: "text", content: "Zoom" },
  { type: "icon", content: "mail" }
];

const footerColumns = [
  {
    title: "PRODUCT",
    links: ["Features", "Pricing", "Request a Demo", "System Status"]
  },
  {
    title: "SOLUTIONS",
    links: ["Healthcare & Clinics", "Beauty & Wellness", "Government Offices", "Education & Colleges"]
  },
  {
    title: "RESOURCES",
    links: ["Documentation", "API Reference", "Contact Support", "Privacy Policy", "Terms of Service"]
  }
];

const Platform: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden px-margin-mobile md:px-margin-desktop py-12 bg-white"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e1e8ff] text-[#151c27] rounded-full text-[13px] font-medium border border-transparent">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Enterprise Grade Scheduling
              </div>
              <h1 className="text-[48px] font-bold text-[#1853d9] tracking-tight leading-tight">
                One Platform.<br />Infinite Possibilities.
              </h1>
              <p className="text-[16px] text-[#434654] leading-relaxed max-w-xl mx-auto lg:mx-0">
                The unified enterprise ecosystem for high-stakes appointment<br className="hidden lg:block"/>
                management, resource optimization, and seamless client<br className="hidden lg:block"/>
                experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button className="bg-[#1853d9] text-white font-bold px-8 py-3 rounded-[12px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(26,86,219,0.3)]">
                  View Solutions
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <button className="bg-[#e1e8ff] text-[#1853d9] font-bold px-8 py-3 rounded-[12px] hover:brightness-95 transition-all">
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative w-full max-w-[500px] mx-auto lg:ml-auto flex justify-center lg:justify-end">
              <div className="bg-white rounded-[20px] p-3 shadow-[0_12px_40px_rgba(26,86,219,0.12)] border border-black/5 w-full">
                <div className="relative aspect-square w-full bg-[#d0d6e0] rounded-[12px] overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 bg-[#1853d9] rounded-[20px] flex items-center justify-center shadow-lg z-20 animate-pulse">
                      <span className="material-symbols-outlined text-white text-[48px]">hub</span>
                    </div>
                    {/* Orbiting nodes */}
                    <div className="absolute w-[75%] h-[75%] border border-dashed border-[#151c27]/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                    <div className="absolute w-10 h-10 bg-[#b8c2d1] text-[#1853d9] rounded-[10px] flex items-center justify-center shadow-md top-8 left-1/2 -translate-x-1/2 z-10">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <div className="absolute w-10 h-10 bg-[#b8c2d1] text-[#1853d9] rounded-[10px] flex items-center justify-center shadow-md bottom-8 left-1/2 -translate-x-1/2 z-10">
                      <span className="material-symbols-outlined text-[20px]">monitoring</span>
                    </div>
                    <div className="absolute w-10 h-10 bg-[#b8c2d1] text-[#1853d9] rounded-[10px] flex items-center justify-center shadow-md left-8 top-1/2 -translate-y-1/2 z-10">
                      <span className="material-symbols-outlined text-[20px]">payments</span>
                    </div>
                    <div className="absolute w-10 h-10 bg-[#b8c2d1] text-[#1853d9] rounded-[10px] flex items-center justify-center shadow-md right-8 top-1/2 -translate-y-1/2 z-10">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                  </div>
                  <img 
                    className="w-full h-full object-cover opacity-30 mix-blend-overlay grayscale" 
                    alt="OmniBook Core Abstract" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBipUVXUZIZ5mBCQSoqhKFmVWdxSKNMvPu_CXy9AxjP4Erce2DeSCB4qJuwQHghQT-DtCOwHi3VXStTqJsfcErZz97fHjY-aiOIoT5h0ZDmaCIuM-1Ri6dTDc7J5Qad8cDGUgHXDm6JItBjjJwaWrTWhWgKTS-02siShdHqZ1MzXXEEduG5JAslFcaUs07rU-dsFaHb0LV0OdcK7DV8WumsGpz9aF3c8JMcuLzJdKUaE7Pnr68AhwD7laA4BZMTCxFsrmDvr8uCZIY"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Based Pillars */}
        <section className="py-16 px-margin-mobile md:px-margin-desktop bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[32px] font-bold text-[#1853d9] mb-4">Tailored for Every Stakeholder</h2>
              <p className="text-[16px] text-[#434654] max-w-2xl mx-auto">Specific tools designed to solve unique challenges across your organization.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((pillar, idx) => (
                <div key={idx} className={`bento-card ${pillar.cardBg} p-8 rounded-[24px] shadow-sm hover:shadow-[0_12px_40px_rgba(26,86,219,0.12)] transition-all duration-300 ${pillar.border} flex flex-col items-start`}>
                  <div className={`w-12 h-12 ${pillar.iconBg} rounded-[12px] flex items-center justify-center text-white mb-6`}>
                    <span className="material-symbols-outlined text-[24px]">{pillar.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] text-[#151c27] mb-1 font-medium">{pillar.role}</h3>
                    <p className="text-[18px] font-bold text-[#1853d9]">{pillar.title}</p>
                  </div>
                  <ul className="space-y-3 w-full mt-10">
                    {pillar.features.map((feature, fIdx) => (
                      <li key={fIdx} className={`flex items-center gap-4 px-4 py-3 ${feature.bg} rounded-[10px]`}>
                        <span className="material-symbols-outlined text-[#1853d9] text-[20px]">{feature.icon}</span>
                        <span className="text-[13px] font-medium text-[#151c27]">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-12 px-margin-mobile md:px-margin-desktop bg-[#f4f7fc]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-md w-full">
                <h2 className="text-[28px] font-bold text-[#1853d9] mb-4">Seamlessly Integrated.</h2>
                <p className="text-[14px] text-[#6b7280] leading-relaxed">
                  Connect OmniBook with the tools you already use. Our<br className="hidden lg:block"/>
                  API-first approach ensures compatibility with top regional<br className="hidden lg:block"/>
                  and global platforms.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-start md:justify-end gap-4 flex-1 w-full">
                {integrations.map((integration, idx) => (
                  <div key={idx} className="bg-white w-[110px] h-[64px] rounded-[12px] flex items-center justify-center shadow-[0_4px_10px_rgba(26,86,219,0.03)] hover:shadow-md transition-shadow">
                    {integration.type === 'text' ? (
                      <span className="font-semibold text-[#94a3b8] text-[16px]">{integration.content}</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#94a3b8] text-[24px]">{integration.content}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-5xl mx-auto mb-16 mt-8 px-4 md:px-0">
          <div className="bg-[#1853d9] rounded-[24px] p-10 md:p-12 relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="absolute top-0 right-0 w-1/2 h-[200%] bg-gradient-to-r from-transparent to-white/10 skew-x-[-20deg] translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
            
            <div className="relative z-10 space-y-3">
              <h2 className="text-white text-[32px] font-bold leading-tight">
                Ready to modernize your<br />
                scheduling?
              </h2>
              <p className="text-white/90 text-[13px] max-w-md">
                Join the elite organizations transforming their service delivery with<br className="hidden md:block" />
                the OmniBook ecosystem.
              </p>
            </div>
            
            <button className="relative z-10 bg-[#10b981] hover:bg-[#059669] text-white rounded-[12px] px-8 py-4 flex items-center gap-6 shadow-md transition-all">
              <span className="text-[15px] font-bold leading-tight text-center">
                Start Using<br />
                OmniBook
              </span>
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Platform;
