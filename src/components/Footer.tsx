import React from 'react';
import { NavLink } from 'react-router';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white w-full shadow-sm border-t border-surface-variant/30">
        {/* Main Footer Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12">
            {/* Column 1: Brand Info */}
            <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-2">
                    <img alt="OmniBook Logo" className="h-10 w-auto object-contain"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzRMdqI5zY2YPFm_RthbsoOp56ys2XhuW2A_2Hb-Rpz3bpiBXhR9AJb5Y4UPbMXlGyjlGbF7tQaYr9OMTizLyH0Ia9_GDKnM5YvZzRCnnvaiohZ_UF_fq_tYgZZR52Hw0XCl22gaGOJL2B01Tms1VsDMPc9mexzfPZB5avS98uCGUb91UZiJdCPA54DUkFbiu6ifIAQ8wpqQjdpqGDw7paVm5mUJTZIZgMXcfZXUxwQGlg-cq4QU9gHUEsGNUNxoF0yAPnmPf8VkM" />
                </div>
                <p className="text-sm sm:text-base text-on-surface-variant mb-4">
                    The unified operating system for modern appointment-based businesses.
                </p>
                <div className="flex gap-4 mt-auto text-secondary">
                    <a aria-label="LinkedIn" className="hover:text-primary transition-colors duration-200" href="#">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>work</span>
                    </a>
                    <a aria-label="Twitter" className="hover:text-primary transition-colors duration-200" href="#">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    </a>
                    <a aria-label="Facebook" className="hover:text-primary transition-colors duration-200" href="#">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                    </a>
                </div>
            </div>
            
            {/* Column 2: PRODUCT */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm sm:text-base font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">PRODUCT</h3>
                <ul className="flex flex-col gap-2.5">
                    <li><NavLink to="/features" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Features</NavLink></li>
                    <li><NavLink to="/pricing" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Pricing</NavLink></li>
                    <li><NavLink to="/book-appointment" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Book Appointment</NavLink></li>
                    <li><NavLink to="/platform" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Platform Overview</NavLink></li>
                </ul>
            </div>
            
            {/* Column 3: SOLUTIONS */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm sm:text-base font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">SOLUTIONS</h3>
                <ul className="flex flex-col gap-2.5">
                    <li><NavLink to="/industries/healthcare" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Healthcare &amp; Clinics</NavLink></li>
                    <li><NavLink to="/industries/beauty-wellness" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Beauty &amp; Wellness</NavLink></li>
                    <li><NavLink to="/industries/government" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Government Offices</NavLink></li>
                    <li><NavLink to="/industries/education" className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Education &amp; Colleges</NavLink></li>
                </ul>
            </div>
            
            {/* Column 4: RESOURCES */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm sm:text-base font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">RESOURCES</h3>
                <ul className="flex flex-col gap-2.5">
                    <li><a className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Documentation</a></li>
                    <li><a className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">API Reference</a></li>
                    <li><a className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Contact Support</a></li>
                    <li><a className="text-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a></li>
                </ul>
            </div>
            
            {/* Column 5: Newsletter */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
                <h3 className="text-sm sm:text-base font-bold text-on-surface mb-2 uppercase tracking-widest">STAY UPDATED</h3>
                <p className="text-sm text-on-surface-variant mb-4">
                    Get the latest news and updates directly in your inbox.
                </p>
                <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                    <label className="sr-only" htmlFor="footer-email">Email address</label>
                    <input
                        className="w-full px-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent text-sm text-on-surface placeholder-on-surface-variant"
                        id="footer-email" placeholder="Enter your email" required type="email" />
                    <button
                        className="w-full py-2.5 px-4 bg-[#1A56DB] text-on-primary font-bold rounded-lg hover:brightness-110 transition-all duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98] text-sm"
                        type="submit">
                        <span>Subscribe</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                </form>
            </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-surface-container-high py-6">
            <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                <p className="text-xs sm:text-sm font-medium tracking-wide text-on-surface-variant">
                    © 2026 OmniBook Enterprise. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
