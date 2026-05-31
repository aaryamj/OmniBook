import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GovernmentPage: React.FC = () => {
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

    const sections = document.querySelectorAll('section, header.hero');
    sections.forEach(section => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-[#f9f9ff] text-[#434654] font-sans selection:bg-[#1a56db]/20 selection:text-[#1a56db] overflow-x-hidden">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <header className="hero bg-[#1853d9] text-white min-h-[70vh] flex flex-col justify-center py-20 px-4 md:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
            <div className="space-y-8">
              <h1 className="text-[40px] md:text-[48px] font-bold leading-[1.15] tracking-tight">
                Transform Citizen Services with Digital Queue Management.
              </h1>
              <p className="text-[16px] md:text-[18px] text-white/90 max-w-xl leading-relaxed">
                Eliminate physical lines and increase operational transparency with our enterprise-grade scheduling engine. Designed for the scale of modern government.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-4 rounded-[12px] font-bold text-[16px] shadow-lg shadow-[#10B981]/20 transition-all hover:-translate-y-1">
                  Request an Enterprise Demo
                </button>
                <button className="border border-white/30 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-[12px] font-bold text-[16px] hover:bg-white/20 transition-all">
                  View Pricing
                </button>
              </div>
            </div>
            <div className="relative group flex justify-center lg:justify-end">
              <div className="absolute -inset-4 bg-[#e1e8ff]/20 rounded-[32px] blur-2xl group-hover:bg-[#e1e8ff]/30 transition-all"></div>
              <img 
                alt="Digital Kiosk Interface" 
                className="relative rounded-[24px] shadow-2xl border border-white/10 object-cover w-full max-w-[600px] h-auto" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHa-qtHmeTrIvHV3rAXbQWYDFCRJdox1Z-IRptACslZlLo20Ui3dEXjQlqGduv-BOpkvdm81FY1_ADRzAOoFkp-pxtTpSE1XfLPMysCyM1o9hCWEHlv4jgdrYwXxBAc7Bll5CwdQt45VDVMQ05_oxxFyap3LSuyUxzn_AOuywZH6VMhz5jOyo3MOJrytT1hatbEEgzdGGDrNjfVw_iI-E5XIyrS1xVhdvodk6PPt9J8kbvsbPYz-UxvK0WX3HQ4Kl-8bKfUxQ9AJ4"
              />
            </div>
          </div>
        </header>

        {/* Section 1: Real-Time Sync */}
        <section className="py-16 px-4 md:px-10 bg-[#f9f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="inline-block bg-[#e1e8ff] text-[#1853d9] px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
                Operational Efficiency
              </span>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                Eliminate Crowds with Real-Time Sync
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed max-w-lg">
                OmniBook synchronizes physical kiosk data with mobile interfaces instantly. Citizens can monitor their queue position from any device, reducing lobby congestion by up to 65% and improving the staff experience.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#151c27] font-medium">Dynamic lobby display integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#151c27] font-medium">Automated SMS and WhatsApp notifications</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="bg-[#eef2fa] rounded-[32px] p-8 shadow-sm overflow-hidden max-w-[550px]">
                <img 
                  alt="Live Queue Display Board" 
                  className="rounded-[20px] shadow-lg w-full h-auto" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY6NGxRrnu_IuRa1tLlUM3EAR2-ZGhOtP4ThVDBCMkVMJ3SXcGJe0lNLdd5S2FOKhALJmd8ls3leZC_dsvGQPeSye3pXji-Il-ljkyYcjwZdH7JeC-aoAWhGFrE2_9xbmztV5D_2pvWwWQxAVok-8GG-eBE_f6RwBIVmrFzYlLhG223w7A-CweS1ZUc9vb-EhAw_gKDQ41Q-nQkJ_aoxsKssBKXJoP2OYmFtaLCw3YNbIVcSWg0ZtcBtExRl01Dcwgo_eAvxezdZA"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Regional Selector */}
        <section className="py-16 px-4 md:px-10 bg-[#f9f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-[#e2e8f8] rounded-[32px] p-8 shadow-sm overflow-hidden flex justify-center max-w-[550px]">
              <img 
                alt="Regional Department Selector UI" 
                className="rounded-[20px] shadow-lg w-full h-auto" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcO5KALnwWvK3kIvAxXn0Br5PVAGyaD8kulpYo5YPy0x7Dd3SHWkgwtr10gqFu40XyUMW_uOzV5mJz9bLrVpZycEh-tdbpJMumlZOlHBElr4f3nmShRK6OERBXOVL6sOjT0vmCJFEkY6uLA5dTjE3E6_DRywzHaGyYJ7Xacr6-pICqV_kpa9s6xfIUzjESqMuq7_31-wW8xUHLeffTsB9mmFpPlD663ApjneqoOOwbsYEBp1XB8bhxDpVQTCs5_EASW60VplNsAdU"
              />
            </div>
            <div className="space-y-6 lg:pl-8">
              <span className="inline-block bg-[#e1e8ff] text-[#1853d9] px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
                Multi-Site Scalability
              </span>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                Seamless Multi-Branch Allocation
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed max-w-lg">
                Manage a nationwide network of offices from a single dashboard. Our regional selector allows administrators to load-balance traffic, reassign staff based on live demand, and maintain consistent service standards across all jurisdictions.
              </p>
              <button className="group flex items-center gap-2 text-[#1853d9] font-bold text-[16px] mt-4 hover:underline">
                Explore Governance Tools
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Administrative Oversight Section */}
        <section className="bg-[#f4f7fc] py-16 px-4 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-[32px] font-bold text-[#151c27] mb-4">
                Administrative Oversight & Analytics
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                Gain deep insights into service performance with JasperReports-powered analytics and automated data reporting.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Analytics Card 1 */}
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 md:p-10 shadow-sm hover:shadow-[0_10px_30px_rgba(26,86,219,0.08)] transition-all border border-[#e2e8f0] flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6">
                  <h3 className="text-[24px] font-bold text-[#1853d9]">Data-Driven Reporting</h3>
                  <p className="text-[15px] text-[#434654] leading-relaxed">
                    Automatically generate compliance reports and performance summaries. Monitor average processing speeds and peak volume periods to optimize staffing schedules.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <span className="bg-[#eef2fa] text-[#151c27] px-4 py-2 rounded-[8px] text-[13px] font-medium border border-[#dce2f3]">
                      PDF Export
                    </span>
                    <span className="bg-[#eef2fa] text-[#151c27] px-4 py-2 rounded-[8px] text-[13px] font-medium border border-[#dce2f3]">
                      Live Dashboards
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 bg-[#eef2fa] rounded-[24px] overflow-hidden p-2">
                  <img 
                    alt="Administrative Analytics Report Preview" 
                    className="rounded-[16px] w-full h-auto shadow-sm" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUI3jULpHXmqQns18mzw2MijN5o_5qDYpuMe531NRecoc3Z74p7mIRgsf-9Bia7uDFWr2flseeEloE9-IkcTguqsZs2qx0xK89XSuWqGb8D7u_Nk4bIkkIjAYGMm6l4OVa0C__u6TMRsxmjM2Pm4mhISrymJGe4Mz4YExt3l2epLNqarRQQNg2NilmdVQbS2jM3q7JNMPUEhklpyt7B8sMsBI-uz_E31gDYmF4JZ8LorHmEIOrZGeVUR-Jv3g2oeYlS4DHO1Hz9uk"
                  />
                </div>
              </div>
              
              {/* Side Features */}
              <div className="flex flex-col gap-8">
                <div className="bg-[#eef2fa] rounded-[32px] p-8 flex-1 hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-[#1853d9] text-[36px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                    security
                  </span>
                  <h4 className="text-[20px] font-bold text-[#151c27] mb-2">Government Security</h4>
                  <p className="text-[15px] text-[#434654] leading-relaxed">
                    SOC2 Type II and FedRAMP compliant data handling protocols.
                  </p>
                </div>
                <div className="bg-white rounded-[32px] p-8 flex-1 shadow-sm border border-[#e2e8f0] hover:shadow-md transition-all">
                  <span className="material-symbols-outlined text-[#10B981] text-[36px] mb-4">
                    group
                  </span>
                  <h4 className="text-[20px] font-bold text-[#1853d9] mb-2">Accessibility First</h4>
                  <p className="text-[15px] text-[#434654] leading-relaxed">
                    Fully WCAG 2.1 Level AA compliant user interfaces for all citizens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GovernmentPage;
