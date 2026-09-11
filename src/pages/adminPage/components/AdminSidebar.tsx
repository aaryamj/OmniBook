import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrganizationTerms } from '../../../utils/organizationTerms';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const terms = useOrganizationTerms();

    // Helper function to determine if a path is active
    const isActive = (path: string) => location.pathname === path;

    const getNavItemClasses = (path: string) => {
        const active = isActive(path);
        return `flex items-center gap-3 px-4 py-3 transition-all cursor-pointer rounded-lg group ${
            active 
                ? 'bg-on-primary-container/15 text-on-primary-container font-semibold border-l-4 border-secondary-container sidebar-active-indicator shadow-sm' 
                : 'text-on-primary-container/75 hover:text-on-primary-container hover:bg-on-primary-container/10 font-medium'
        }`;
    };

    const getNavIconClasses = (path: string) => {
        return `material-symbols-outlined transition-colors ${
            isActive(path) 
                ? 'text-on-primary-container' 
                : 'text-on-primary-container/70 group-hover:text-on-primary-container'
        }`;
    };

    useEffect(() => {
        const handleToggle = () => setIsMobileOpen(prev => !prev);
        const handleClose = () => setIsMobileOpen(false);

        window.addEventListener('omni-toggle-sidebar', handleToggle);
        window.addEventListener('omni-close-sidebar', handleClose);

        return () => {
            window.removeEventListener('omni-toggle-sidebar', handleToggle);
            window.removeEventListener('omni-close-sidebar', handleClose);
        };
    }, []);

    // Auto-close on navigation
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`flex flex-col h-screen fixed left-0 top-0 w-[280px] bg-primary-container border-r border-outline-variant z-50 transition-transform duration-300 ease-in-out ${
                isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
            }`}>
                <div className="p-6 flex items-center justify-between gap-3 border-b border-on-primary-container/10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            <img 
                                alt="OmniBook Logo" 
                                className="object-contain h-[38px]"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANVa2DIMhxwJVhPP1FnM5XPZK669t-OaZbij7sEQY2BcRjKXoLi4Xlx3422j-PoJTMmPiR5Xs2jHyWkiOQbHG2PC_dwX1bTvLCKfZJr4xERFe5jC_Eg1nCXbH4JYQNcg8LmT7jvnS2rIU1qOMeCUzpati4NDHk55Jw4yD9q-c3RF-j48vJ6qqLiyYcMo90ZH-HOFSGJv14g2VG5oLaR8SvPRMAYcJZQSHy3gVOym_POA_776_joTMmbnqxiUzecB0QZUzztl5CrHw" 
                            />
                        </div>
                        <div>
                            <p className="font-label-md text-label-md text-on-primary-container font-semibold opacity-95">
                                {localStorage.getItem('organizationName') ? `${localStorage.getItem('organizationName')} Console` : 'Admin Console'}
                            </p>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-on-primary-container/10 text-on-primary-container border border-on-primary-container/20">
                                {terms.facilityLabel}
                            </span>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button 
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden p-1.5 rounded-lg text-on-primary-container hover:bg-on-primary-container/10 transition-colors cursor-pointer"
                        aria-label="Close sidebar"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>
                
                <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    <a 
                        className={getNavItemClasses('/admin/dashboard')}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        <span className={getNavIconClasses('/admin/dashboard')} style={{ fontVariationSettings: isActive('/admin/dashboard') ? "'FILL' 1" : "" }}>dashboard</span>
                        <span className="font-body-md">Dashboard</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/appointments')}
                        onClick={() => navigate('/admin/appointments')}
                    >
                        <span className={getNavIconClasses('/admin/appointments')} style={{ fontVariationSettings: isActive('/admin/appointments') ? "'FILL' 1" : "" }}>{terms.appointmentsNavIcon}</span>
                        <span className="font-body-md">{terms.appointmentsNavLabel}</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/providers')}
                        onClick={() => navigate('/admin/providers')}
                    >
                        <span className={getNavIconClasses('/admin/providers')} style={{ fontVariationSettings: isActive('/admin/providers') ? "'FILL' 1" : "" }}>{terms.providersNavIcon}</span>
                        <span className="font-body-md">{terms.providersNavLabel}</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/crm')}
                        onClick={() => navigate('/admin/crm')}
                    >
                        <span className={getNavIconClasses('/admin/crm')} style={{ fontVariationSettings: isActive('/admin/crm') ? "'FILL' 1" : "" }}>{terms.customersNavIcon}</span>
                        <span className="font-body-md">{terms.customerPlural} CRM</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/ledger')}
                        onClick={() => navigate('/admin/ledger')}
                    >
                        <span className={getNavIconClasses('/admin/ledger')} style={{ fontVariationSettings: isActive('/admin/ledger') ? "'FILL' 1" : "" }}>account_balance_wallet</span>
                        <span className="font-body-md">Ledger</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/subscription')}
                        onClick={() => navigate('/admin/subscription')}
                    >
                        <span className={getNavIconClasses('/admin/subscription')} style={{ fontVariationSettings: isActive('/admin/subscription') ? "'FILL' 1" : "" }}>loyalty</span>
                        <span className="font-body-md">Subscription & Billing</span>
                    </a>
                    <a 
                        className={getNavItemClasses('/admin/settings')}
                        onClick={() => navigate('/admin/settings')}
                    >
                        <span className={getNavIconClasses('/admin/settings')} style={{ fontVariationSettings: isActive('/admin/settings') ? "'FILL' 1" : "" }}>settings</span>
                        <span className="font-body-md">Settings</span>
                    </a>
                </nav>

                <div className="mt-auto border-t border-on-primary-container/10 p-2">
                    <a 
                        className="flex items-center gap-3 px-4 py-3 text-on-primary-container/75 hover:text-on-primary-container hover:bg-on-primary-container/10 transition-colors cursor-pointer rounded-lg font-medium group" 
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login');
                        }}
                    >
                        <span className="material-symbols-outlined text-on-primary-container/70 group-hover:text-on-primary-container transition-colors">logout</span>
                        <span className="font-body-md">Logout</span>
                    </a>
                </div>
            </aside>
        </>
    );
}
