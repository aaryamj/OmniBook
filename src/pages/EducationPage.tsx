import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EducationPage: React.FC = () => {
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
        <header className="hero relative bg-white py-16 px-4 md:px-10 min-h-[70vh] flex items-center overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f0f4fc] -skew-x-12 transform translate-x-1/2 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full relative z-10">
            <div className="space-y-6">
              <h1 className="text-[40px] md:text-[56px] font-bold text-[#1853d9] leading-[1.1] tracking-tight">
                Simplify Campus Scheduling for Faculty and Students.
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#434654] max-w-xl leading-relaxed">
                Hassle-free office hours, academic counseling, and lab resource bookings designed for modern universities.
              </p>
              <div className="pt-4">
                <button className="bg-[#006f4b] hover:bg-[#005438] text-white px-8 py-4 rounded-[12px] font-bold text-[16px] shadow-lg shadow-[#006f4b]/20 transition-all hover:-translate-y-1">
                  Deploy on Your Campus
                </button>
              </div>
            </div>
            <div className="relative group flex justify-center lg:justify-end">
              <img 
                alt="Students and faculty" 
                className="relative rounded-[24px] shadow-2xl object-cover w-full max-w-[600px] h-auto" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl5tsUMZAh769Bt5VoEfyc_OqyVp8f3qOKe-Zh8imcKSDhvNznNwTcvvPEVOQiVWVkbwWZcD_bUGwaZcLdvq2mJEP4S1n8UAxkI0AW9Hh3xVImb4iCp-5Bpu6bxf1igEyEGQab4s1yY0kNkzg8ZcEwWwMg1Jw3ugzvK1nicArevlL1ISv2FcX8kfpTKLYHzO-NoncI8iQqWD3BE4FPuTlLUR_Digc6ZUEeqJ68qEvDwacl90JYLJd6Q6Nrptn2M_Y9ahNW8poHuwc"
              />
            </div>
          </div>
        </header>

        {/* Section 1: Classic Calendars */}
        <section className="py-16 px-4 md:px-10 bg-[#f9f9ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="inline-block bg-[#e1e8ff] text-[#1853d9] px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
                Time Management
              </span>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                Traditional Control with Classic Calendars
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed max-w-lg">
                Empower faculty with intuitive calendar management. Define 15-minute thesis review slots, recurring office hours, or one-off academic counseling sessions with a single click.
              </p>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Instant slot availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Automated buffer times</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#006f4b] text-[24px]">check_circle</span>
                  <span className="text-[16px] text-[#434654] font-medium">Department-wide synchronization</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <img 
                alt="Calendar Interface" 
                className="rounded-[24px] shadow-xl w-full max-w-[550px] h-auto hover:-translate-y-1 transition-transform" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkMmHBMxWR-65JH5eXKQcr5v9FJ0PJS1HhyWEg4spuqqeM8Gr3-mNdX-kXzteI8PDPKa1UV3KmYZEA_wQnDrTWr3l-9TaRWhvlxo1Q-eRn6SOod-CDinTXKfv3iMY-w7gI-TaPu3IeFp0hHon2Nm3j6ASspz36nyt0BJgdJ8PF0S15VS7u7qlJ4jCYLNU2pxF_b7vPpW1VVJ6rcJzaQ65fFwZjb2uVam7AP-3uenzbEUsaTZnaRUMzFcXle2dSrwOyTUOLFAurtVo"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Instant Communication */}
        <section className="py-16 px-4 md:px-10 bg-[#f0f3ff]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start">
              <img 
                alt="Communication Dashboard" 
                className="rounded-[24px] shadow-xl w-full max-w-[550px] h-auto hover:-translate-y-1 transition-transform" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN9ZikRq8v6Py8bJty3pw0E4YzRZ6w4ej3-dgMgKXq9M8bI6-xruMmM2DklCy8yyAf-pOpcijM8TaaISp4gh1CjGyY6aEwDgGjU0Vzsm9Z-W89xK1zCP964Z-iAYcaLfu5oAN60NncdWygnqt0sgqVNyEKIA32RDY1mReW00DZizFlM23gvJms904zHD9d_3W0IjnOEE0s8XB4JiP67IYsIw7uFWmiiTR519YiomWh9gktGS6ZhR0UTwc4NfPZ3R3xfiDLr_EsqFc"
              />
            </div>
            <div className="space-y-6 lg:pl-8">
              <span className="inline-block bg-[#dcece2] text-[#006f4b] px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
                Seamless Connectivity
              </span>
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] leading-tight">
                Instant Communication Channels
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed max-w-lg">
                Never miss a meeting with our robust notification engine. Integrated JavaMail protocols ensure students and faculty receive real-time confirmations, reminders, and schedule updates directly in their inboxes.
              </p>
              
              <div className="mt-8 bg-white p-6 rounded-[16px] shadow-sm border-l-4 border-[#1853d9]">
                <p className="italic text-[#434654] text-[15px] leading-relaxed mb-4">
                  "The automated reminders have reduced our no-show rate for academic advising by 40% in just one semester."
                </p>
                <p className="font-bold text-[#1853d9] text-[15px]">
                  — Dean of Student Affairs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Inclusive & Accessible */}
        <section className="bg-[#f9f9ff] py-16 px-4 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-[32px] md:text-[40px] font-bold text-[#1853d9] mb-4 leading-tight">
                Inclusive & Accessible for Every Student
              </h2>
              <p className="text-[16px] text-[#434654] leading-relaxed">
                We believe education should be accessible to all. Our platform is built from the ground up to exceed WCAG 2.1 standards.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] hover:shadow-[0_10px_30px_rgba(26,86,219,0.1)] hover:-translate-y-1 transition-all space-y-4">
                <span className="material-symbols-outlined text-[#1853d9] text-[32px]">visibility</span>
                <h3 className="text-[20px] font-bold text-[#151c27]">Screen Reader Optimized</h3>
                <p className="text-[15px] text-[#434654] leading-relaxed">
                  Semantic HTML and ARIA labels ensure a seamless experience for visually impaired users.
                </p>
              </div>
              <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] hover:shadow-[0_10px_30px_rgba(26,86,219,0.1)] hover:-translate-y-1 transition-all space-y-4">
                <span className="material-symbols-outlined text-[#1853d9] text-[32px]">translate</span>
                <h3 className="text-[20px] font-bold text-[#151c27]">Multi-Language Support</h3>
                <p className="text-[15px] text-[#434654] leading-relaxed">
                  Full support for English, Español, Français, and 12 other languages to serve global campuses.
                </p>
              </div>
              <div className="bg-white p-8 rounded-[24px] shadow-[0_4px_20px_rgba(26,86,219,0.05)] hover:shadow-[0_10px_30px_rgba(26,86,219,0.1)] hover:-translate-y-1 transition-all space-y-4">
                <span className="material-symbols-outlined text-[#1853d9] text-[32px]">keyboard_command_key</span>
                <h3 className="text-[20px] font-bold text-[#151c27]">Keyboard Navigation</h3>
                <p className="text-[15px] text-[#434654] leading-relaxed">
                  Effortless booking and management using only keyboard shortcuts and tab indexing.
                </p>
              </div>
            </div>

            <div className="mt-16 rounded-[24px] overflow-hidden shadow-xl">
              <img 
                alt="Accessibility features" 
                className="w-full h-64 md:h-80 object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkzTSnJpWWc4ZGROconYAG_fmHaP5dw_llpMDrujN_WtU0pUIL962kAntF8wGhgpNiKNOY04-da_cKB0h4mdWjWgeNkJalKKJlwsCoxqkzIgr4ElyNFDJ30gOKC8UubaPjVYgfQ02sNu2v0-YVe5luSj6b4VUDAqKvqX97LQlrtaHz4u2aH_Rb0MMuqtrSr38Xt9IBmJOs-g3dA612QoQZXthlPcwd7Y4mirhClRO1czsUiuO3oka52ZKJWiQAlN7CWSdYP0vC_6Y"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EducationPage;
