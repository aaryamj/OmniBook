import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isIndustriesOpen, setIsIndustriesOpen] = useState(false);
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
        setIsIndustriesOpen(false);
    };

    return (
        <header className={`fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md transition-all duration-300 ${isScrolled ? 'shadow-md' : 'nav-shadow'}`}>
            <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 h-20 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-2">
                    <NavLink to="/" onClick={closeMobileMenu} className="flex items-center">
                        <img 
                            alt="OmniBook Logo" 
                            className="object-contain h-[38px] sm:h-[40px]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBGM-SzqEFqFbc4ndJzPxlYxX_jDrFVYF8BxEZKtVXcSEOMUBIQnd5hhCVzpJAT7ks5uFbIA5nfvi8ee-O8cmrCa2qS07ASXk2Ll7_U4-jmfDwa0IMrFVBdOQtUimYthunUmzoi7nwVqfv76YRIxmVy8M-Q0SQZVUuLby79aZjL3a6oE5hErM11kb0oqmDvTUor_-hCfo15Nh9xWCHGVYcqzG5boZSbBms839N-a8lpS2WO3BRj27mDrj7UZB2zmVSxnh5569xPxs" 
                        />
                    </NavLink>
                </div>
                
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) => isActive ? "text-base font-semibold text-primary border-b-2 border-primary pb-0.5" : "text-base text-secondary hover:text-primary transition-colors duration-200"}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/platform"
                        className={({ isActive }) => isActive ? "text-base font-semibold text-primary border-b-2 border-primary pb-0.5" : "text-base text-secondary hover:text-primary transition-colors duration-200"}
                    >
                        Platform
                    </NavLink>
                    <div className="relative group">
                        <button
                            className="flex items-center gap-1 text-base text-secondary hover:text-primary transition-colors duration-200 py-2 cursor-pointer"
                        >
                            Industries
                            <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:rotate-180">expand_more</span>
                        </button>
                        <div
                            className="absolute top-full left-0 mt-1 w-60 bg-surface shadow-xl rounded-xl border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="p-2 space-y-1">
                                <NavLink
                                    to="/industries/healthcare"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface"
                                >
                                    Healthcare
                                </NavLink>
                                <NavLink 
                                    to="/industries/beauty-wellness"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface"
                                >
                                    Beauty & Wellness
                                </NavLink>
                                <NavLink 
                                    to="/industries/government"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface"
                                >
                                    Government
                                </NavLink>
                                <NavLink 
                                    to="/industries/education"
                                    className="block p-3 rounded-lg hover:bg-surface-container-low transition-colors text-sm font-medium text-on-surface"
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
                                ? "text-base text-primary border-b-2 border-primary font-semibold pb-0.5"
                                : "text-base text-secondary hover:text-primary transition-colors duration-200"
                        }
                    >
                        Features
                    </NavLink>
                    <NavLink 
                        to="/pricing"
                        className={({ isActive }) => 
                            isActive 
                                ? "text-base text-primary border-b-2 border-primary font-semibold pb-0.5"
                                : "text-base text-secondary hover:text-primary transition-colors duration-200"
                        }
                    >
                        Pricing
                    </NavLink>
                </nav>

                <div className="flex items-center gap-3 sm:gap-4">
                    <NavLink
                        to="/login"
                        className="hidden sm:inline-block text-sm font-medium text-secondary hover:text-primary transition-colors px-2 py-1.5"
                    >
                        Log In
                    </NavLink>
                    <NavLink
                        to="/register"
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-tertiary text-on-tertiary rounded-xl text-xs sm:text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
                    >
                        Get Started
                    </NavLink>
                    <button
                        className="md:hidden p-2 text-secondary hover:text-primary flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        <span className="material-symbols-outlined text-[26px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-surface-variant bg-surface/95 backdrop-blur-lg shadow-2xl animate-in slide-in-from-top duration-200 max-h-[calc(100vh-80px)] overflow-y-auto">
                    <nav className="flex flex-col p-6 gap-4">
                        <NavLink 
                            to="/" 
                            end 
                            onClick={closeMobileMenu} 
                            className={({ isActive }) => `text-base font-semibold py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary hover:bg-surface-container-low'}`}
                        >
                            Home
                        </NavLink>
                        <NavLink 
                            to="/platform" 
                            onClick={closeMobileMenu} 
                            className={({ isActive }) => `text-base font-semibold py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary hover:bg-surface-container-low'}`}
                        >
                            Platform
                        </NavLink>
                        
                        {/* Industries Accordion */}
                        <div className="border border-surface-variant/50 rounded-xl overflow-hidden bg-surface-container-lowest">
                            <button 
                                onClick={() => setIsIndustriesOpen(!isIndustriesOpen)}
                                className="w-full flex items-center justify-between p-3 text-base font-semibold text-secondary hover:text-primary transition-colors text-left"
                            >
                                <span>Industries</span>
                                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isIndustriesOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            {isIndustriesOpen && (
                                <div className="p-2 space-y-1 bg-surface border-t border-surface-variant/40">
                                    <NavLink to="/industries/healthcare" onClick={closeMobileMenu} className="block py-2 px-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-container-low">Healthcare</NavLink>
                                    <NavLink to="/industries/beauty-wellness" onClick={closeMobileMenu} className="block py-2 px-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-container-low">Beauty & Wellness</NavLink>
                                    <NavLink to="/industries/government" onClick={closeMobileMenu} className="block py-2 px-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-container-low">Government</NavLink>
                                    <NavLink to="/industries/education" onClick={closeMobileMenu} className="block py-2 px-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-container-low">Education</NavLink>
                                </div>
                            )}
                        </div>

                        <NavLink 
                            to="/features" 
                            onClick={closeMobileMenu} 
                            className={({ isActive }) => `text-base font-semibold py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary hover:bg-surface-container-low'}`}
                        >
                            Features
                        </NavLink>
                        <NavLink 
                            to="/pricing" 
                            onClick={closeMobileMenu} 
                            className={({ isActive }) => `text-base font-semibold py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-secondary hover:text-primary hover:bg-surface-container-low'}`}
                        >
                            Pricing
                        </NavLink>

                        <div className="h-px bg-surface-variant w-full my-2"></div>
                        
                        <div className="flex flex-col gap-3">
                            <NavLink 
                                to="/login" 
                                onClick={closeMobileMenu}
                                className="w-full text-center py-3 rounded-xl border border-outline-variant font-semibold text-primary hover:bg-primary/5 transition-colors"
                            >
                                Log In
                            </NavLink>
                            <NavLink 
                                to="/register" 
                                onClick={closeMobileMenu}
                                className="w-full text-center py-3 bg-tertiary text-on-tertiary rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm"
                            >
                                Get Started
                            </NavLink>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
