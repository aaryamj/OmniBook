import { useEffect, useState } from 'react';

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useEffect(() => {
        // Simple scroll behavior for header
        const handleScroll = () => {
            const header = document.querySelector('header');
            if (header) {
                if (window.scrollY > 20) {
                    header.classList.add('shadow-md');
                } else {
                    header.classList.remove('shadow-md');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    (entry.target as HTMLElement).style.opacity = '1';
                    (entry.target as HTMLElement).style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const cards = document.querySelectorAll('.bento-card');
        cards.forEach(card => {
            (card as HTMLElement).style.opacity = '0';
            (card as HTMLElement).style.transform = 'translateY(20px)';
            (card as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            observer.observe(card);
        });
        
        const animatedElements = document.querySelectorAll('.animate-in:not(.bento-card)');
        animatedElements.forEach(el => {
             observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="bg-surface text-on-surface font-sans text-base selection:bg-primary-fixed selection:text-on-primary-fixed">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md nav-shadow transition-all duration-300">
                <div className="flex justify-between items-center px-4 md:px-10 h-20 max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-2">
                        <img alt="OmniBook Logo" className="object-contain h-[40px]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBGM-SzqEFqFbc4ndJzPxlYxX_jDrFVYF8BxEZKtVXcSEOMUBIQnd5hhCVzpJAT7ks5uFbIA5nfvi8ee-O8cmrCa2qS07ASXk2Ll7_U4-jmfDwa0IMrFVBdOQtUimYthunUmzoi7nwVqfv76YRIxmVy8M-Q0SQZVUuLby79aZjL3a6oE5hErM11kb0oqmDvTUor_-hCfo15Nh9xWCHGVYcqzG5boZSbBms839N-a8lpS2WO3BRj27mDrj7UZB2zmVSxnh5569xPxs" />
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-base font-semibold text-primary border-b-2 border-primary"
                            href="#">Home</a>
                        <a className="text-base text-secondary hover:text-primary transition-colors duration-200"
                            href="#">Platform</a>
                        <div className="relative group">
                            <button
                                className="flex items-center gap-1 text-base text-secondary hover:text-primary transition-colors duration-200">
                                Industries
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </button>
                            <div
                                className="absolute top-full left-0 mt-2 w-56 bg-surface shadow-xl rounded-xl border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="p-2 space-y-1">
                                    <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                        href="#">Healthcare</a>
                                    <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                        href="#">Beauty &amp; Wellness</a>
                                    <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                        href="#">Government</a>
                                    <a className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                        href="#">Education</a>
                                </div>
                            </div>
                        </div>
                        <a className="text-base text-secondary hover:text-primary transition-colors duration-200"
                            href="#">Features</a>
                        <a className="text-base text-secondary hover:text-primary transition-colors duration-200"
                            href="#">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button
                            className="hidden sm:block text-sm font-medium text-secondary hover:text-primary transition-colors">Log
                            In</button>
                        <button
                            className="px-6 py-2.5 bg-tertiary text-on-tertiary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm">Get
                            Started</button>
                        <button 
                            className="md:hidden p-2 text-secondary flex items-center justify-center" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-20 left-0 w-full bg-surface shadow-2xl border-b border-surface-variant md:hidden">
                        <nav className="flex flex-col p-6 gap-6">
                            <a className="text-base font-semibold text-primary" href="#">Home</a>
                            <a className="text-base text-secondary hover:text-primary" href="#">Platform</a>
                            <div className="space-y-3">
                                <span className="text-base font-medium text-secondary block">Industries</span>
                                <div className="pl-4 flex flex-col gap-4 border-l-2 border-surface-variant">
                                    <a className="text-sm text-secondary hover:text-primary" href="#">Healthcare</a>
                                    <a className="text-sm text-secondary hover:text-primary" href="#">Beauty &amp; Wellness</a>
                                    <a className="text-sm text-secondary hover:text-primary" href="#">Government</a>
                                    <a className="text-sm text-secondary hover:text-primary" href="#">Education</a>
                                </div>
                            </div>
                            <a className="text-base text-secondary hover:text-primary" href="#">Features</a>
                            <a className="text-base text-secondary hover:text-primary" href="#">Pricing</a>
                            <div className="h-px bg-surface-variant w-full my-2"></div>
                            <button className="text-left text-base font-medium text-secondary hover:text-primary">Log In</button>
                        </nav>
                    </div>
                )}
            </header>
            <main className="pt-20">
                {/* Hero Section */}
                <section className="px-4 md:px-10 py-12 max-w-screen-2xl mx-auto overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-fade-in-up">
                            <span
                                className="inline-block px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-medium uppercase tracking-wider">Enterprise-Ready</span>
                            <h1
                                className="text-5xl lg:text-[64px] lg:leading-[72px] font-bold text-on-background max-w-xl tracking-tight">
                                Smart Scheduling for <span className="text-primary">Modern</span> Businesses.
                            </h1>
                            <p className="text-lg text-secondary max-w-lg leading-relaxed">
                                Skip the waiting room and eliminate double bookings. OmniBook provides a seamless, AI-powered
                                experience for clients and administrators alike.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    className="px-8 py-4 bg-tertiary text-on-tertiary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-2">
                                    Book an Appointment Now
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                                <button
                                    className="px-8 py-4 bg-surface-container-low text-primary rounded-xl text-sm font-bold hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                    Explore Our AI Chatbot
                                </button>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary-container/10 rounded-[3rem] blur-3xl opacity-50"></div>
                            <img alt="Product Interface"
                                className="relative w-full rounded-2xl shadow-[0_20px_50px_rgba(26,86,219,0.15)] bento-card"
                                data-alt="A sleek desktop monitor showing a professional enterprise dashboard with a high-fidelity calendar interface and a QR code check-in widget. The surrounding office is bright and minimalist with soft natural lighting and elegant indoor plants, emphasizing a modern corporate aesthetic with soft blue and white tones."
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqUx0zfQyZhrCNlZ55CjkBvWycOhzOoSiQwTLNvM03sq70Fg3EopOmiru4TyOu1-lli_34pf423uR410MKbn5zI0t3zCzY2ogJS-coABFbu7ge2yJSRAqqnpV_CPiv10DGboji6bQ0GDJG-Eqhdmez2n2WSiBtajEJRHopxodnCj9fF5iOdW9GLTiwPu5IVUJsBDzGZPGcP9PuKsy52II1yOdsEA0fMeK6qF1k1KPovGPpUfl4NLGgOneC4B1DH3yfcgK8NGZOOsM"
                            />
                        </div>
                    </div>
                </section>
                {/* Features Bar */}
                <section className="bg-surface-container-lowest py-8 border-y border-surface-variant/30">
                    <div className="px-4 md:px-10 max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" data-weight="fill">sync</span>
                            </div>
                            <div>
                                <p className="text-xl font-medium">Real-Time Sync</p>
                                <p className="text-xs font-medium tracking-wide text-secondary">Instant updates across all devices</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" data-weight="fill">qr_code_2</span>
                            </div>
                            <div>
                                <p className="text-xl font-medium">Contactless Check-in</p>
                                <p className="text-xs font-medium tracking-wide text-secondary">Secure QR-based authentication</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" data-weight="fill">robot_2</span>
                            </div>
                            <div>
                                <p className="text-xl font-medium">AI Chatbot</p>
                                <p className="text-xs font-medium tracking-wide text-secondary">Automated booking assistance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined" data-weight="fill">payments</span>
                            </div>
                            <div>
                                <p className="text-xl font-medium">Secure Payments</p>
                                <p className="text-xs font-medium tracking-wide text-secondary">Unified eSewa &amp; Khalti support</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Industry Categories Grid */}
                <section className="px-4 md:px-10 py-12 max-w-screen-2xl mx-auto">
                    <div className="text-center mb-12 space-y-6">
                        <h2 className="text-[32px] font-semibold tracking-tight text-on-background">Tailored Solutions for Every Industry
                        </h2>
                        <p className="text-lg text-secondary max-w-2xl mx-auto leading-relaxed">OmniBook scales with your needs,
                            whether you're a single clinic or a multi-campus university.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Healthcare */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-6">
                            <div
                                className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[32px]">stethoscope</span>
                            </div>
                            <h3 className="text-2xl font-semibold">Hospitals &amp; Clinics</h3>
                            <p className="text-base text-secondary">Manage patient flow and specialist rotations
                                with zero friction.</p>
                            <a className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto" href="#">Learn
                                More <span className="material-symbols-outlined text-sm">chevron_right</span></a>
                        </div>
                        {/* Beauty */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-6">
                            <div
                                className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[32px]">content_cut</span>
                            </div>
                            <h3 className="text-2xl font-semibold">Salons &amp; Spas</h3>
                            <p className="text-base text-secondary">Client profiles, loyalty rewards, and automated
                                appointment reminders.</p>
                            <a className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto" href="#">Learn
                                More <span className="material-symbols-outlined text-sm">chevron_right</span></a>
                        </div>
                        {/* Government */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-6">
                            <div
                                className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[32px]">corporate_fare</span>
                            </div>
                            <h3 className="text-2xl font-semibold">Government</h3>
                            <p className="text-base text-secondary">Digitize public service appointments and
                                minimize lobby crowding.</p>
                            <a className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto" href="#">Learn
                                More <span className="material-symbols-outlined text-sm">chevron_right</span></a>
                        </div>
                        {/* Education */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-6">
                            <div
                                className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[32px]">school</span>
                            </div>
                            <h3 className="text-2xl font-semibold">Colleges</h3>
                            <p className="text-base text-secondary">Streamline registrar visits, faculty meetings,
                                and campus tours.</p>
                            <a className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto" href="#">Learn
                                More <span className="material-symbols-outlined text-sm">chevron_right</span></a>
                        </div>
                    </div>
                </section>
                {/* CTA Section (Atmospheric) */}
                <section className="px-4 md:px-10 py-12 mb-12">
                    <div
                        className="max-w-screen-2xl mx-auto rounded-[2rem] bg-primary-container p-12 lg:p-32 text-center text-on-primary-container relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]">
                        </div>
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold max-w-3xl mx-auto text-white tracking-tight">Ready to revolutionize your booking
                                system?</h2>
                            <p className="text-lg text-primary-fixed-dim max-w-xl mx-auto opacity-90 leading-relaxed">Join over
                                10,000 enterprises worldwide who trust OmniBook for their mission-critical scheduling.</p>
                            <div className="flex justify-center gap-6">
                                <button
                                    className="px-10 py-5 bg-white text-primary rounded-xl text-sm font-bold hover:shadow-xl transition-all scale-100 hover:scale-105">Get
                                    Started for Free</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer
                className="bg-white w-full shadow-sm border-t border-surface-variant/30">
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
        </div>
    );
}
