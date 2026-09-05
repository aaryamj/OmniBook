import { useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
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
            observer.disconnect();
        };
    }, []);

    return (
        <div className="bg-surface text-on-surface font-sans text-base selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
            <Navbar />
            <main className="pt-20">
                {/* Hero Section */}
                <section className="px-4 sm:px-6 md:px-10 py-8 sm:py-12 max-w-screen-2xl mx-auto overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
                            <span
                                className="inline-block px-3.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold uppercase tracking-wider">Enterprise-Ready</span>
                            <h1
                                className="text-3xl sm:text-5xl lg:text-[60px] lg:leading-[68px] font-bold text-on-background max-w-xl tracking-tight">
                                Smart Scheduling for <span className="text-primary">Modern</span> Businesses.
                            </h1>
                            <p className="text-base sm:text-lg text-secondary max-w-lg leading-relaxed">
                                Skip the waiting room and eliminate double bookings. OmniBook provides a seamless, AI-powered
                                experience for clients and administrators alike.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                                <button
                                    onClick={() => navigate('/book-appointment')}
                                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-tertiary text-on-tertiary rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                                    <span>Book an Appointment</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </button>
                                <button
                                    onClick={() => navigate('/book-appointment')}
                                    className="w-full sm:w-auto px-7 py-3.5 sm:py-4 bg-surface-container-low text-primary rounded-xl text-sm font-bold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                    <span>Explore AI Chatbot</span>
                                </button>
                            </div>
                        </div>
                        <div className="relative group mt-4 lg:mt-0">
                            <div className="absolute -inset-4 bg-primary-container/10 rounded-[2rem] sm:rounded-[3rem] blur-2xl sm:blur-3xl opacity-50"></div>
                            <img alt="Product Interface"
                                className="relative w-full rounded-2xl shadow-[0_15px_40px_rgba(26,86,219,0.12)] bento-card object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqUx0zfQyZhrCNlZ55CjkBvWycOhzOoSiQwTLNvM03sq70Fg3EopOmiru4TyOu1-lli_34pf423uR410MKbn5zI0t3zCzY2ogJS-coABFbu7ge2yJSRAqqnpV_CPiv10DGboji6bQ0GDJG-Eqhdmez2n2WSiBtajEJRHopxodnCj9fF5iOdW9GLTiwPu5IVUJsBDzGZPGcP9PuKsy52II1yOdsEA0fMeK6qF1k1KPovGPpUfl4NLGgOneC4B1DH3yfcgK8NGZOOsM"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Bar */}
                <section className="bg-surface-container-lowest py-8 sm:py-10 border-y border-surface-variant/30">
                    <div className="px-4 sm:px-6 md:px-10 max-w-screen-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="flex items-center gap-4 p-2">
                            <div
                                className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined">sync</span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-on-surface">Real-Time Sync</p>
                                <p className="text-xs font-medium text-secondary">Instant updates across all devices</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-2">
                            <div
                                className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined">qr_code_2</span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-on-surface">Contactless Check-in</p>
                                <p className="text-xs font-medium text-secondary">Secure QR-based authentication</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-2">
                            <div
                                className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined">robot_2</span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-on-surface">AI Scheduling</p>
                                <p className="text-xs font-medium text-secondary">Gemini 3.5 Flash-Lite assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-2">
                            <div
                                className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary shrink-0">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-on-surface">Secure Payments</p>
                                <p className="text-xs font-medium text-secondary">Unified eSewa &amp; Stripe support</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Industry Categories Grid */}
                <section className="px-4 sm:px-6 md:px-10 py-12 sm:py-16 max-w-screen-2xl mx-auto">
                    <div className="text-center mb-10 sm:mb-14 space-y-3 sm:space-y-4">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-on-background">
                            Tailored Solutions for Every Industry
                        </h2>
                        <p className="text-sm sm:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
                            OmniBook scales with your needs, whether you're a single clinic or a multi-campus healthcare network.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Healthcare */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
                            <div
                                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[28px]">stethoscope</span>
                            </div>
                            <h3 className="text-xl font-bold">Hospitals &amp; Clinics</h3>
                            <p className="text-sm text-secondary leading-relaxed">Manage patient flow and specialist rotations with zero friction.</p>
                            <NavLink to="/industries/healthcare" className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto text-sm">
                                Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </NavLink>
                        </div>
                        {/* Beauty */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
                            <div
                                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[28px]">content_cut</span>
                            </div>
                            <h3 className="text-xl font-bold">Salons &amp; Spas</h3>
                            <p className="text-sm text-secondary leading-relaxed">Client profiles, loyalty rewards, and automated appointment reminders.</p>
                            <NavLink to="/industries/beauty-wellness" className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto text-sm">
                                Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </NavLink>
                        </div>
                        {/* Government */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
                            <div
                                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
                            </div>
                            <h3 className="text-xl font-bold">Government</h3>
                            <p className="text-sm text-secondary leading-relaxed">Digitize public service appointments and minimize lobby crowding.</p>
                            <NavLink to="/industries/government" className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto text-sm">
                                Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </NavLink>
                        </div>
                        {/* Education */}
                        <div className="bento-card p-6 rounded-2xl bg-surface-container-low flex flex-col items-center text-center space-y-4">
                            <div
                                className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-[28px]">school</span>
                            </div>
                            <h3 className="text-xl font-bold">Colleges</h3>
                            <p className="text-sm text-secondary leading-relaxed">Streamline registrar visits, faculty meetings, and campus consultations.</p>
                            <NavLink to="/industries/education" className="text-primary font-semibold hover:underline flex items-center gap-1 mt-auto text-sm">
                                Learn More <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </NavLink>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-4 sm:px-6 md:px-10 py-8 sm:py-12 mb-12">
                    <div
                        className="max-w-screen-2xl mx-auto rounded-3xl bg-primary-container p-8 sm:p-14 lg:p-20 text-center text-on-primary-container relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]">
                        </div>
                        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                Ready to revolutionize your booking system?
                            </h2>
                            <p className="text-sm sm:text-base text-primary-fixed-dim opacity-90 leading-relaxed">
                                Join over 10,000 enterprises worldwide who trust OmniBook for their mission-critical scheduling.
                            </p>
                            <div className="pt-2">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-primary rounded-xl text-sm font-bold hover:shadow-xl transition-all scale-100 hover:scale-105 cursor-pointer">
                                    Get Started for Free
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
