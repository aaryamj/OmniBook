import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-md' : 'nav-shadow'}`}>
            <div className="flex justify-between items-center px-4 md:px-10 h-20 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-2">
                    <NavLink to="/" onClick={closeMobileMenu}>
                        <img alt="OmniBook Logo" className="object-contain h-[40px]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBGM-SzqEFqFbc4ndJzPxlYxX_jDrFVYF8BxEZKtVXcSEOMUBIQnd5hhCVzpJAT7ks5uFbIA5nfvi8ee-O8cmrCa2qS07ASXk2Ll7_U4-jmfDwa0IMrFVBdOQtUimYthunUmzoi7nwVqfv76YRIxmVy8M-Q0SQZVUuLby79aZjL3a6oE5hErM11kb0oqmDvTUor_-hCfo15Nh9xWCHGVYcqzG5boZSbBms839N-a8lpS2WO3BRj27mDrj7UZB2zmVSxnh5569xPxs" />
                    </NavLink>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => isActive ? "text-base font-semibold text-primary border-b-2 border-primary" : "text-base text-secondary hover:text-primary transition-colors duration-200"}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/platform"
                        className={({ isActive }) => isActive ? "text-base font-semibold text-primary border-b-2 border-primary" : "text-base text-secondary hover:text-primary transition-colors duration-200"}
                    >
                        Platform
                    </NavLink>
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1 text-base text-secondary hover:text-primary transition-colors duration-200">
                            Industries
                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                        </button>
                        <div
                            className="absolute top-full left-0 mt-2 w-56 bg-surface shadow-xl rounded-xl border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="p-2 space-y-1">
                                <NavLink
                                    to="/industries/healthcare"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Healthcare
                                </NavLink>
                                <NavLink 
                                    to="/industries/beauty-wellness"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Beauty & Wellness
                                </NavLink>
                                <NavLink 
                                    to="/industries/government"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Government
                                </NavLink>
                                <NavLink 
                                    to="/industries/education"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors"
                                >
                                    Education
                                </NavLink>
                            </div>
                        </div>
                    </div>
                    <NavLink 
                        to="/features"
                        className={({ isActive }) => 
                            isActive 
                                ? "font-body-md text-body-md text-primary border-b-2 border-primary font-semibold"
                                : "font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-200"
                        }
                    >
                        Features
                    </NavLink>
                    <NavLink 
                        to="/pricing"
                        className={({ isActive }) => 
                            isActive 
                                ? "font-body-md text-body-md text-primary border-b-2 border-primary font-semibold"
                                : "font-body-md text-body-md text-secondary hover:text-primary transition-colors duration-200"
                        }
                    >
                        Pricing
                    </NavLink>
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
                        <NavLink to="/" end onClick={closeMobileMenu} className={({ isActive }) => isActive ? "text-base font-semibold text-primary" : "text-base text-secondary hover:text-primary"}>Home</NavLink>
                        <NavLink to="/platform" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "text-base font-semibold text-primary" : "text-base text-secondary hover:text-primary"}>Platform</NavLink>
                        <NavLink to="/industries/healthcare" onClick={closeMobileMenu} className="text-sm text-secondary hover:text-primary">Healthcare</NavLink>
                        <div className="space-y-3">
                            <span className="text-base font-medium text-secondary block">Industries</span>
                            <div className="pl-4 flex flex-col gap-4 border-l-2 border-surface-variant">
                                <a className="text-sm text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Healthcare</a>
                                <a className="text-sm text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Beauty &amp; Wellness</a>
                                <a className="text-sm text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Government</a>
                                <a className="text-sm text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Education</a>
                            </div>
                        </div>
                        <a className="text-base text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Features</a>
                        <a className="text-base text-secondary hover:text-primary" onClick={closeMobileMenu} href="#">Pricing</a>
                        <div className="h-px bg-surface-variant w-full my-2"></div>
                        <button className="text-left text-base font-medium text-secondary hover:text-primary" onClick={closeMobileMenu}>Log In</button>
                    </nav>
                </div>
            )}
        </header>
    );
}
