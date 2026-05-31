import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BeautyWellnessPage: React.FC = () => {
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
    <div className="bg-[#f9f9ff] text-[#434654] font-sans selection:bg-[#1a56db]/20 selection:text-[#1a56db] overflow-x-hidden">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-[#f9f9ff] py-16 px-4 md:px-10 min-h-[80vh] flex items-center">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 relative">
              <span className="inline-block px-4 py-1 bg-[#e1e8ff] text-[#1853d9] text-[12px] font-bold tracking-wider rounded-full mb-6 uppercase">
                REVENUE OPTIMIZATION
              </span>
              <h1 className="text-[40px] md:text-[56px] font-bold text-[#1853d9] leading-[1.1] mb-6 max-w-xl">
                Maximize Chair Occupancy and Delight Clients.
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#434654] mb-10 max-w-lg leading-relaxed">
                The ultimate salon management engine designed for high-performance teams. Automate your booking workflow and keep your salon at 100% capacity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-[16px] font-bold shadow-lg shadow-[#10B981]/20 hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Boost Your Salon Revenue
                </button>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#e7eefe] rounded-full blur-3xl opacity-50"></div>
              <div className="relative rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(26,86,219,0.15)] border-[6px] border-[#e7eefe]">
                <img 
                  alt="Hero Image" 
                  className="w-full h-auto object-cover max-w-[550px]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo2_dH2OP0Z6TQiJyJ5C8GJ1ukDN3cpC0lLVR0IqPGMBrlZAP8XfomHd-t8I2lBykjL6UV4DCemEXYUIxQZw41pUx_FGW1seFgfKsXaORNJqvrHOIMKPbwq05rD0QayXo-HR2Kd6A7nl4IryZZmPWel0Kfb1eSV0p_6hYk__0ZFCm7eKJBMp9M97lj8SQWiL8aa2qkoIedBmgbV185smsrJ6wPcHnfV2DiuEeOq5ih1-qLJ7nXWQycKkDdqvjXwYm5YbBON3c-Nw0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Zig-Zag Feature 1: Payments */}
        <section className="py-16 px-4 md:px-10 bg-[#f9f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight mb-6 max-w-md">
                Secure Revenue with Online Payments
              </h2>
              <p className="text-[16px] text-[#434654] mb-10 leading-relaxed max-w-lg">
                Say goodbye to no-shows and late cancellations. Integrated payment gateways like eSewa and Khalti allow you to capture deposits or full payments at the moment of booking, ensuring your stylists' time is always valued.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-[24px]">check_circle</span>
                  <span className="text-[15px] font-medium text-[#151c27]">Instant payment confirmation for clients</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#10B981] text-[24px]">check_circle</span>
                  <span className="text-[15px] font-medium text-[#151c27]">Automated digital receipts & invoicing</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 flex justify-center lg:justify-end">
              <div className="rounded-[32px] overflow-hidden p-8 bg-[#eef2fa] max-w-[500px]">
                <img 
                  alt="Payments Interface" 
                  className="w-full h-auto rounded-[20px] shadow-2xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq79K8aspbhaG3pxoMZqGLer8WifXq8L_eqBC8mwiy6UVCleMlFbBzm38UXR0LtGRJQ2CpxRl2n9GLvd9oVxdZ1-SzOkCdxBkbJmdX4WZFFGwBVc5z40ADJ0Vf7s3_ANA8jaIVrbEKfH4uI7nGdNspKBTwZiwlJKCVVDa-bVCNzV70vP4Cr9PJBharz5LGT_1majjMfMA8gegq6CkYqoV_9YgIdPKgQZdaXD1_yTXOVZa9kjIJytKyeNl-ZyeZq5Q5c0e7WFd9Cxo"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Zig-Zag Feature 2: Personalization */}
        <section className="py-16 px-4 md:px-10 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="bg-[#eef2fa] p-8 rounded-[32px] flex justify-center max-w-[550px]">
              <img 
                alt="Staff Profiles" 
                className="w-full h-auto rounded-[20px] shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbI--3hbcuJttl_G1VRSQivS5YHzZhYOiD_qD0_yekYnz63L6YmjWjWLjasJX-e6_4qBvIdBJaukm5eYbH3KPSlEr2IU6XRwpd5W1AxPmShqKXEx3Q8MtGw7A6tgAVmBJZph9G1SrNxrAUaBJVoyXNsSrKKSoWcHmC2E7SWGRzwPZ0VVAVMIQzFnjIrEflG4Tt2q52hL3q5FkvLPAKCjExqPfuIP24IJbp6-MiJTaA8mkCbkXMp67ehDefYEmPfMWvn-xAPeyy1mY"
              />
            </div>
            <div className="lg:pl-8">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight mb-6 max-w-md">
                Enable Personalized Styling Experiences
              </h2>
              <p className="text-[16px] text-[#434654] mb-10 leading-relaxed max-w-lg">
                Empower your clients to choose the perfect stylist for their needs. Highlight staff specializations, view portfolios, and match client preferences with the right expertise to build long-term loyalty.
              </p>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="p-4 bg-[#f0f4fc] rounded-[16px]">
                  <div className="text-[28px] font-bold text-[#1853d9] mb-1">98%</div>
                  <p className="text-[13px] font-medium text-[#434654]">Client Retention</p>
                </div>
                <div className="p-4 bg-[#f0f4fc] rounded-[16px]">
                  <div className="text-[28px] font-bold text-[#1853d9] mb-1">15+</div>
                  <p className="text-[13px] font-medium text-[#434654]">Expert Stylists</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Efficiency Section: QR Check-in */}
        <section className="py-16 px-4 md:px-10 bg-[#f4f7fc]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-[32px] font-bold text-[#1853d9] mb-4">Modern Efficiency</h2>
              <p className="text-[16px] text-[#434654]">Streamline your front-desk operations with contactless technology.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="relative group flex justify-center">
                  <div className="absolute -inset-4 bg-[#1853d9]/5 rounded-[40px] blur-xl transition-all group-hover:bg-[#1853d9]/10"></div>
                  <img 
                    alt="QR Check-in System" 
                    className="relative w-full max-w-[600px] h-auto rounded-[24px] shadow-2xl object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOzw7_MccxuNUVla-WM_HrBOPQMUjJuZjGkkrpXvijNPEJTAowqNE4E-fUXJGr7-NBauUqIMJCgX-nTifJxLDMmt9_TGA4xS0dtlEcNPEng9QuFGYBLm2FKKj-cfX6aCV31l6MgCQzfWehQvtl2MSRLhoNlSBjpEU7tYyCJZi09BuDvUC0MV3qfZBBZVEtKqWdAbIZ6V0X2Yo-INYeSn0LlhyJAvymzRsy4DS_k4stRBPcx3Ol-xhqaI69ZhZa02z14C1tlz_jeYI"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#e2e8f0] hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#e1e8ff] p-3 rounded-[12px]">
                      <span className="material-symbols-outlined text-[#1853d9]">qr_code_scanner</span>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-[#151c27] mb-2">Automated QR Code Check-In</h3>
                      <p className="text-[14px] text-[#434654] leading-relaxed">Clients scan a unique code upon arrival to instantly notify their stylist and update appointment status.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#e2e8f0] hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#e6f0fa] p-3 rounded-[12px]">
                      <span className="material-symbols-outlined text-[#3b82f6]">notifications_active</span>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-[#151c27] mb-2">Real-time Notifications</h3>
                      <p className="text-[14px] text-[#434654] leading-relaxed">Instantly alert staff members when their next client has arrived, reducing wait times and lobby congestion.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-[#e2e8f0] hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="bg-[#dcfce7] p-3 rounded-[12px]">
                      <span className="material-symbols-outlined text-[#10b981]">analytics</span>
                    </div>
                    <div>
                      <h3 className="text-[18px] font-bold text-[#151c27] mb-2">Wait Time Analytics</h3>
                      <p className="text-[14px] text-[#434654] leading-relaxed">Track entry-to-chair times to optimize your staff scheduling and improve the overall client experience.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Banner */}
        <section className="bg-[#0a358c] py-16 px-4 md:px-10 text-center">
          <h2 className="text-[28px] font-bold text-white mb-8">Ready to Transform Your Salon?</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
            <input 
              className="w-full sm:w-80 px-6 py-4 rounded-[12px] bg-white text-[#151c27] focus:ring-2 focus:ring-[#1853d9] outline-none border-none shadow-inner" 
              placeholder="Enter your business email" 
              type="email"
            />
            <button className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-4 rounded-[12px] font-bold transition-colors shadow-lg shadow-[#10B981]/20 w-full sm:w-auto">
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BeautyWellnessPage;
