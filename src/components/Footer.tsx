import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white w-full shadow-sm border-t border-surface-variant/30">
        {/* Main Footer Layout */}
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Column 1: Brand Info */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center mb-2">
                    <img alt="OmniBook Logo" className="h-10 w-auto object-contain"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzRMdqI5zY2YPFm_RthbsoOp56ys2XhuW2A_2Hb-Rpz3bpiBXhR9AJb5Y4UPbMXlGyjlGbF7tQaYr9OMTizLyH0Ia9_GDKnM5YvZzRCnnvaiohZ_UF_fq_tYgZZR52Hw0XCl22gaGOJL2B01Tms1VsDMPc9mexzfPZB5avS98uCGUb91UZiJdCPA54DUkFbiu6ifIAQ8wpqQjdpqGDw7paVm5mUJTZIZgMXcfZXUxwQGlg-cq4QU9gHUEsGNUNxoF0yAPnmPf8VkM" />
                </div>
                <p className="text-base text-on-surface-variant mb-6">
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
                        <span className="material-symbols-outlined"
                            style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                    </a>
                </div>
            </div>
            {/* Column 2: PRODUCT */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">PRODUCT</h3>
                <ul className="flex flex-col gap-4">
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Features</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Pricing</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Request a Demo</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">System Status</a></li>
                </ul>
            </div>
            {/* Column 3: SOLUTIONS */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">SOLUTIONS</h3>
                <ul className="flex flex-col gap-4">
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Healthcare &amp; Clinics</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Beauty &amp; Wellness</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Government Offices</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Education &amp; Colleges</a></li>
                </ul>
            </div>
            {/* Column 4: RESOURCES */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-[#1A56DB] mb-2 uppercase tracking-widest">RESOURCES</h3>
                <ul className="flex flex-col gap-4">
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Documentation</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">API Reference</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Contact Support</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Privacy Policy</a></li>
                    <li><a className="text-base text-on-surface-variant hover:text-primary transition-colors duration-200"
                        href="#">Terms of Service</a></li>
                </ul>
            </div>
            {/* Column 5: Newsletter */}
            <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-on-surface mb-2 uppercase tracking-widest">STAY UPDATED</h3>
                <p className="text-base text-on-surface-variant mb-6">
                    Get the latest news and features directly in your inbox.
                </p>
                <form className="flex flex-col gap-4 mt-auto" onSubmit={(e) => e.preventDefault()}>
                    <label className="sr-only" htmlFor="footer-email">Email address</label>
                    <input
                        className="w-full px-4 py-2 bg-white border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent text-base text-on-surface placeholder-on-surface-variant"
                        id="footer-email" placeholder="Enter your email" required type="email" />
                    <button
                        className="w-full py-2 px-4 bg-[#1A56DB] text-on-primary font-bold rounded-lg hover:brightness-110 transition-all duration-200 shadow-sm flex justify-center items-center gap-2 cursor-pointer active:scale-[0.98]"
                        type="submit">
                        <span>Subscribe</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                </form>
            </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-surface-container-high py-6">
            <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
                <p className="text-sm font-medium tracking-wide text-on-surface-variant">
                    © 2026 OmniBook Enterprise. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
