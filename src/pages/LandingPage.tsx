import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingPage() {
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
        <div className="bg-surface text-on-surface font-sans text-base selection:bg-primary-fixed selection:text-on-primary-fixed">
            <Navbar />
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
            <Footer />
        </div>
    );
}
